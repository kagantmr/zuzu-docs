---
layout: page
title: Memory
section: Kernel
prowl:
  - {title: "Memory", url: "/zuzu-docs/2.x/concepts/memory/"}
---

## Physical memory

The physical memory manager (`kernel/mm/pmm.c`) tracks 4 KiB frames with a bitmap placed right after the kernel image. Boot marks the kernel, the initrd, the DTB and the bitmap itself as used, and everything else in the RAM range found in the DTB is free. Frames are allocated and freed one at a time.

## Kernel heap

The kernel heap starts at 256 KiB and grows in chunks of at least 64 KiB. It combines a general allocator for variable sizes with **slab caches** for fixed-size objects (ports, notifications, handle entries, shared memory descriptors). A slab cache keeps one empty slab around so it does not thrash the grow path.

## Address spaces

The kernel lives in the high half of the address space. The user half is switched on context switch using `TTBR0`; the kernel half never changes. TLB entries are tagged with an **ASID**, so switching between processes does not flush the TLB.

An address space is a page-table root plus a vector of regions. Each region carries its protection, its memory type (normal or device), and who owns the backing frames:

| Owner | Frames | On destroy |
|---|---|---|
| anonymous | allocated by the PMM for this space | freed |
| shared | belong to a shared memory object | unmapped only |
| none | device registers or external memory | unmapped only |

A region can be **pinned**, in which case it cannot be unmapped. The syspage mapping is pinned.

## Mapping memory

`MemMap` is one syscall for three kinds of mapping, chosen by the handle:

- `HANDLE_ANON` maps fresh zeroed pages of the requested size;
- a **shared memory** handle maps the object at a kernel-chosen address (the size comes from the object, so pass `0`);
- a **device** handle maps its register window as device memory (also `0`, and never executable).

Protections are `PROT_READ`, `PROT_WRITE` and `PROT_EXEC`. A mapping cannot be writable and executable at once; the request fails with `ERR_BADARG`. `MemProtect` changes the protection of an existing region and `MemUnmap` removes one. Pages are **lazy**: they are only allocated and zeroed when first touched.

## Shared memory

`ShmemCreate(size)` returns a handle to a memory object of up to 32 MiB, rounded up to whole pages. Frames are allocated on first fault, not at creation. The object's reference count counts **live handles**, not mappings: creation holds one, every `Grant` adds one, and every close or teardown drops one. The frames are freed when the last handle goes. Unmapping never changes the count.

To share memory, create it, `Grant` the handle to the other process, and have both `MemMap` it. Pair it with a notification (see [Notifications]({{ '/kernel/notifications/' | relative_url }})) so a writer can tell the reader there is new data.

## User layout

Each process gets a fixed 4-page stack and a thread-local region of TCB pages (see [Processes & threads]({{ '/kernel/processes/' | relative_url }})). Everything else is claimed through `MemMap`, which returns the address it chose; in 1.x the address is always picked by the kernel.

## Memory pressure

Version 1.2 added a memory-pressure notification and an OOM handler: when free frames run low the kernel signals the registered notification.
