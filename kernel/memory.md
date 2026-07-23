---
layout: page
title: Memory
section: Kernel
---

zuzu keeps only address-space management in the kernel. Everything above it (allocation policy, the heap, the
object model) is built from: 1. a physical page allocator, 2. per-process page tables, 3. a handle-based
syscall surface for mapping memory into a process. This page covers all three. The high-level virtual layout
lives on the [Architecture]({{ '/kernel/architecture/' | relative_url }}) page; here it is the reference for everything
below.

## Virtual address space

```
0xFFFFFFFF ┌─────────────────────┐
           │   MMIO region       │  (ioremap window, Device memory,
           │   Kernel stacks     │   kernel stack slots at 0xF1000000)
0xF0000000 ├─────────────────────┤
           │   (unmapped guard)  │
           ├─────────────────────┤
           │   Kernel heap       │
           │   Kernel BSS/data   │
           │   Kernel text       │
0xC0000000 ├─────────────────────┤  <- KERNEL_VA_BASE
           │   (unmapped)        │
0x80000000 ├─────────────────────┤  <- TTBR split (TTBCR.N = 1)
           │   User space        │  (per-process, switched via TTBR0)
0x00000000 └─────────────────────┘
```

The ARM MMU uses two translation table base registers at once. `TTBR1` holds the kernel's L1 table
and **never changes** meaning the kernel is mapped for every process, so it stays visible
without copying its mappings into each address space. `TTBR0` holds the
current process's L1 table and is rewritten on every context switch. `TTBCR.N = 1` puts the split
at `0x80000000`: addresses below it resolve through `TTBR0` (per-process), addresses
at or above through `TTBR1` (kernel). With `N = 1` a user L1 table only needs to cover
2 GB, so it is 2048 entries (8 KB) instead of the full 16 KB.

Kernel VAs are a fixed offset from physical addresses (`PA + KERNEL_VA_OFFSET`), so the kernel can
reach any managed frame through its linear map without per-page bookkeeping. Boot starts on an identity
mapping; once the higher-half tables are live the kernel relocates its stacks, unmaps the identity region,
and runs pure higher-half from then on.

Inside a process, the layout is fixed by per-board constants (values below are the vexpress-a15 board):

```
0x80000000 ┌─────────────────────┐  <- USER_VA_TOP
           │   Stack             │  (8 MB reserve, grows down,
           │                     │   faulted in on demand)
0x7F800000 ├─────────────────────┤
           │   Stack guard page  │  (never mapped; overflow faults)
0x7F7FF000 ├─────────────────────┤
           │   Device window     │  (MMIO mappings, bump cursor)
0x7F000000 ├─────────────────────┤
           │   (unmapped)        │
           │   mmap area         │  (anon + shared mappings, bump
0x20000000 ├─────────────────────┤   cursor; TCB page sits first)
           │   (unmapped)        │
           │   ELF image         │
0x00010000 ├─────────────────────┤
           │   syspage (RO)      │
0x00001000 ├─────────────────────┤
           │   NULL guard page   │
0x00000000 └─────────────────────┘
```

Every process gets two pages mapped before its ELF is even loaded. The **syspage** at
`0x1000` is a single kernel-owned page mapped read-only into every process; the kernel publishes
system information there (free memory counters are updated by the page allocator on every alloc/free) so
userspace can read it without a syscall. The **TCB page** is the first mmap-area page: a
read-write page holding per-thread slots, which is where a thread finds its own state and its lmsg buffer.
Both are pinned — `memunmap` and `memprotect` refuse to touch them.

The **NULL guard page** at `0x0` turns null-pointer dereferences into faults instead
of silent reads of low memory. The **stack guard page** below the stack reserve is a region
that exists but never maps: running off the bottom of the stack faults into it and kills the process rather
than silently corrupting the device window below.

<div class="note">Because <code>TTBR0</code> still points at the faulting process during a syscall, the kernel
can read user memory directly while servicing the call, which is what makes pointer validation and the
<code>SVC</code> instruction fetch possible.
</div>

<hr>

## Address spaces are region lists

An address space is a small kernel object: the physical address of its L1 table, an ASID, and a sorted
vector of **regions**. A region records a VA range, its protection, its memory type
(normal or device), and — the important part — its *ownership*:

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Owner</th>
<th>Backing</th>
<th>On unmap/teardown</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>ANON</code></td>
<td>Frames allocated from the PMM for this address space</td>
<td>Walk the page table, free every frame that was actually faulted in</td>
</tr>
<tr>
<td><code>SHARED</code></td>
<td>Frames owned by a shared-memory object (or another subsystem)</td>
<td>Unmap only; the object keeps its pages</td>
</tr>
<tr>
<td><code>NONE</code></td>
<td>MMIO / external memory, not PMM pages at all</td>
<td>Unmap only; nothing to free</td>
</tr>
</tbody>
</table>
</div>

The region list is the truth; page tables are derived from it. Insertion keeps the vector sorted and rejects
overlaps, so lookups (fault handling, `memprotect`, pointer validation) are binary searches.
Regions can exist without any page-table entries at all: that is what makes demand paging work.

Each user address space gets an **ASID**, so a context switch is a TTBR0 write plus an ASID
change instead of a full TLB flush; stale translations from a dead address space are flushed by ASID before
the number is reused.

<hr>

## Physical memory

Physical RAM is discovered from the **device tree** at boot; nothing about the physical map is
hardcoded. The PMM tracks it two ways at once, one bit and one pointer per 4 KB frame:

The **bitmap** (one bit per frame, placed right after the kernel image) is the authority on
allocated/free, and is what range-based operations (reserving boot regions, contiguous allocation) walk.
The **freelist** makes the common case fast: each free page stores the PA of the next free
page in its own first word, so single-page allocation is popping the head. The two are kept in
sync, and the freelist is self-healing: any node that fails validation causes a rebuild from the bitmap
instead of a crash. All of it sits behind a spinlock.

At init the PMM reserves everything already in use: the boot code, the kernel image, the DTB (wherever the
bootloader happened to put it), the bitmap itself, the exception-mode stacks, and any firmware
`/memreserve/` ranges such as the Pi 4's spin tables.

Three allocation shapes cover every consumer. Single frames for demand paging and kernel objects;
**contiguous runs** for page tables and the heap; and
**scattered** allocation, which fills a caller-provided array with whatever frames are free.
Scattered is what shared-memory objects use since they never need physical contiguity, so they never fail just
because RAM is fragmented.

## Kernel heap

Kernel objects (PCBs, handle tables, address-space structs, region vectors) come from a small in-kernel heap
via `kmalloc`/`kfree`: a first-fit list of blocks that splits on allocation and
coalesces neighbours on free, growing by grabbing contiguous pages from the PMM when it runs dry. It lives
in the linear map, so a heap VA is always `PA + offset`

Objects that churn on every IPC operation skip the heap: endpoints, reply capabilities, and device
capabilities are carved from per-type **slab caches**, one page at a time with an intrusive
freelist per slab. Allocation and free are O(1) pointer pops, and freeing never merges or scans.

<hr>

## Page tables and permissions

ARMv7 translation is two-level: L1 entries cover 1 MB sections, L2 tables refine them to 4 KB
pages. The kernel's linear map uses sections; user memory is always mapped as 4 KB pages. User
mappings carry AP bits marking them user-accessible; kernel mappings are privileged-only, so a user access
to `0xC0000000` faults rather than reading kernel text.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>AP[2:0]</th>
<th>PL1 (kernel)</th>
<th>PL0 (user)</th>
<th>Use</th>
</tr>
</thead>
<tbody>
<tr>
<td>0b001</td>
<td>read/write</td>
<td>none</td>
<td>kernel code/data</td>
</tr>
<tr>
<td>0b011</td>
<td>read/write</td>
<td>read/write</td>
<td>user code/data</td>
</tr>
<tr>
<td>0b101</td>
<td>read-only</td>
<td>none</td>
<td>kernel read-only</td>
</tr>
<tr>
<td>0b111</td>
<td>read-only</td>
<td>read-only</td>
<td>user read-only</td>
</tr>
<tr>
<td>0b000</td>
<td>none</td>
<td>none</td>
<td>guard / unmapped</td>
</tr>
</tbody>
</table>
</div>

**W^X is enforced globally.** No mapping is ever writable and executable at the same time. The
check sits at every entrance: `memmap` and `memprotect` reject
`WRITE|EXEC` up front, the ELF loader's injection path enforces it, and the mapping layer itself
refuses a `WRITE|EXEC` user mapping as a last line. `EXEC` is rejected outright on
device memory. The kernel validates userspace `prot` against W^X, then ORs in
`VM_PROT_USER` itself, so a process can never mint a kernel-privileged mapping by choosing its
own protection bits.

The kernel applies the same discipline to itself: bring-up necessarily runs on permissive mappings, so once
boot completes the kernel walks its own L1/L2 tables and forces every kernel-image entry to
kernel-only access, then flushes the TLB so the old permissions are gone.

<hr>

## The memory ABI

Loaf froze a single mapping primitive. `memmap` absorbs what were previously separate "attach
shared memory" and "map device" calls. Now the handle selects what backs the mapping, and everything
else is uniform.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Call</th>
<th>Effect</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>memmap(handle | HANDLE_ANON(-1), size, prot, flags)</code></td>
<td>Map anonymous, shared, or device memory into the caller; returns the virtual address.</td>
</tr>
<tr>
<td><code>memunmap(addr)</code></td>
<td>Unmap a whole region by its base address.</td>
</tr>
<tr>
<td><code>memprotect(addr, size, prot)</code></td>
<td>Change protection on a page-aligned range within one region.</td>
</tr>
<tr>
<td><code>shm_create(size)</code></td>
<td>Create a shared-memory object; returns a handle.</td>
</tr>
<tr>
<td><code>grant(handle, target)</code></td>
<td>Transfer a handle to another process (capability transfer).</td>
</tr>
<tr>
<td><code>destroy(handle)</code></td>
<td>Free the backing object; returns <code>ERR_BUSY</code> if it is still mapped anywhere.</td>
</tr>
</tbody>
</table>
</div>

The first `memmap` argument is either a real handle to a shared-memory or device object from the
caller's handle table or the sentinel `HANDLE_ANON` (`-1`) for fresh anonymous
pages. The rules differ slightly by what backs the mapping:

- **Anonymous:** `size` must be a page multiple and is capped at 32 MB
    (`ERR_OVERFLOW` beyond that). The VA comes from the process's mmap bump cursor.
- **Shared memory:** `size` must be `0` since the size belongs to the
    object, fixed at `shm_create`. One mapping per handle: mapping an already-mapped handle
    returns `ERR_BUSY`.
- **Device:** `size` must be `0` (the size comes from the device
    capability) and `EXEC` is refused. The VA is carved from the separate device window, not the
    mmap area.

`flags` is reserved and must be `0` in Loaf which is exactly what lets a future
kernel add mapping flags without a new syscall. Passing `VM_PROT_USER` yourself is
`ERR_BADARG`; the kernel adds it.

On success `memmap` returns the mapped VA in `r0`; on failure it returns a small
negative error. The two never collide because the top page of the address space is the error band: any
return value `≥ (uintptr_t)-4095` is an error code, anything else is a valid pointer
(`zuzu_is_err()` in libzuzu wraps this test).

`memunmap(addr)` requires the *exact base* of a region. Offsets into a region are
`ERR_BADARG`, which closes off partial-unmap tricks. Pinned regions (syspage, TCB page) return
`ERR_NOPERM`. What happens next follows region ownership: anonymous regions walk the page table
and free only the frames that were actually faulted in; shared and device unmaps clear the owning handle's
mapping record so the handle can be mapped again.

Lifetime is explicit and ordered. An object-backed region is released in two steps:
`memunmap(addr)` to remove the mapping, then `destroy(handle)` to free the object.
`destroy` refuses (`ERR_BUSY`) while any mapping of the object survives, so a region
can never be freed out from under a process that still has it mapped. Anonymous regions have no separate
object; `memunmap(addr)` both unmaps and frees them.

`memprotect` operates on page-aligned ranges that fall inside a single region — spanning two
regions is refused, as is making device memory executable, as is touching a pinned region. The region
record is updated together with the page tables so the two never disagree.

<div class="note">Loaf's <code>memunmap</code> is whole-region only. Partial unmapping (POSIX
<code>munmap</code> semantics) is a compatible 1.x addition, <code>SYS_MEMUNMAP_RANGE</code> added
<em>beside</em> <code>memunmap</code>.
</div>

One more mapping path exists outside the general ABI: `asinject`, callable **only by
init**, writes a buffer into a frozen (not-yet-started) process at a chosen VA and protection. It is
the mechanism the userspace ELF loader uses to place segments into a child before its first instruction
runs. It enforces the same W^X rule, and when the destination falls inside an existing anonymous region
(the demand-paged stack reserve, say) it fills pages in place rather than creating a new region — with the
injected protection capped by the region's own.

<hr>

## Demand paging

An anonymous `memmap` reserves a virtual range without committing physical frames: the region is
recorded, no page-table entries are made. The first access takes a translation fault, and the data-abort
handler does the work: find the region containing the fault address, check it is not a guard region or
device memory, check the access direction against the region's protection (a write to a read-only region
is not a fault to fix, it is a fault to kill), then allocate one frame, zero it, map it, flush that one
TLB entry, and resume. The process never observes any of this.

The user stack is the biggest client: every process gets an 8 MB stack *reserve* that costs
nothing until touched, faulted in page by page as the stack grows down. If a fault lands in a region that
refuses it — or in no region at all — a user-mode process is killed with a segmentation fault; the same
fault taken from kernel mode while the address is a user VA means a syscall was handed a bad pointer, and
becomes `ERR_BADPTR` for the caller instead of a kernel panic.

Syscalls that need a user buffer to be resident use the same machinery in the other direction: the kernel
pre-faults the buffer's pages (checking write permission when it intends to write) before doing the copy,
so demand paging and IPC compose instead of fighting.

## Shared memory

Message passing moves control commands: four registers per rendezvous. Long messages (lmsg) is usually used
for strings and is capped at 512 bytes. For anything larger, two
processes map the same shared-memory object into their own address spaces and exchange only a small
message to coordinate. This is the load-bearing split in the whole system: **Messages carry intent,
    shared memory carries data.**

An SHM object in the kernel is just a page array plus a reference count. `shm_create(size)`
rounds the size up to whole pages (capped at 32 MB) but allocates *no memory yet* — the array
slots are empty, and pages are faulted in lazily when either side first touches them, so a large object
that is sparsely used stays cheap. The pages come from scattered allocation and are never physically
contiguous.

The owner creates an SHM object and receives a handle; it hands a handle to a peer with `grant`;
both call `memmap` on their handle to get a view of the same physical pages. The reference count
counts *handles, not mappings* — creation is one reference, each grant adds one, each destroy or
process teardown drops one — and when the last handle goes, the faulted-in pages are returned to the PMM.
Synchronization is the callers' responsibility, so for now the kernel guarantees the shared frames, not a
protocol over them. SHM is part of Loaf, which is what lets memory-heavy userspace avoid copying through
the kernel.

## Device memory

A userspace driver maps its device's registers with the same `memmap` call, backed by a device
handle. Device mappings are **Device-nGnRE** (non-cacheable, non-gathering, ordered), the same
`TEX/C/B` attributes the kernel's `ioremap` uses. They live in their own VA window
(`0x7F000000`–`0x7F7FE000`) with its own bump cursor, away from the mmap area, and
`EXEC` is always rejected on device memory. Device regions are never demand-paged — the physical
address is the device, mapped eagerly at `memmap` time.

Mapping registers hands a process real hardware, so this is a privileged operation gated by capability, not
open to any process.

## ioremap (kernel side)

The kernel's own device access goes through `ioremap(pa, size)`, which maps MMIO into the
reserved window at `0xF0000000`. Mappings are made in 1&nbsp;MB sections: the requested PA is
aligned down to a section, enough sections to cover it are claimed from a slot bitmap, and the caller gets
back the VA plus the offset into the first section. `iounmap` takes that VA back, unmaps the
sections and clears the slots. The table is deliberately tiny (16 live mappings) — the kernel itself only
ever needs the interrupt controller, a UART, and whatever early boot pokes at; everything else belongs to
userspace drivers via the device window above.

<hr>
