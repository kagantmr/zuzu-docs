---
layout: page
title: zuzu kernel releases
section: Project
---

Feature list of zuzu kernel releases. The kernel majors are codenamed after **cat behaviours**.

## zuzu v1.0 Loaf

First version of the zuzu microkernel. Introduced the first versions of the concepts in the documents.

### zuzu v1.1

- **Markers and stamping:** Ports can be reintroduced into handle tables with “markers” to demultiplex clients from each other. The marker can be “stamped” via the `ZuzuStamp(port, marker_value)` syscall. The marker can only be seen in the result struct of `WaitAny()`.
- **Kernel benchmarking:** Toggle via `ZUZU_BENCH` in `mk/config.mk`
- **Lazy BSS:** BSS section is lazy-mapped, only zeroed and mapped when a page fault happens.
- **Fix thread cap:** Max thread cap increased from 7 (bounded by TCB structs per page) to 256 via a bitmap allocator of TCB pages.
- **New style in code:** more explanatory and modern `PascalCase` instead of `snake_case` 
- **New Makefile system:** Board-specific and arch-specific Makefiles.
- **Full state dump:** VFPU registers are also dumped in panics and process crashes.
- **Change compiler flags:** `-O2` to `-O3`, `-falign-functions=64` to support LTO.
- **Compiler hints:** `likely`/`unlikely`, `hot`, `cold`, `always_inline` and `noinline` attributes, `restrict`
- **Direct-switch handoff:** `MsgCall()` and `MsgLCall()` can use a fast-path to directly switch to the message recipient.
- **Lazy VFP:** VFPU is off after context switch, first use traps to the excep
tion handler which enables it and hands it off.
- **Remove U-Boot:** Rely on QEMU/firmware passing DTB to `r2`.
- **Separate initrd from kernel:** initrd is no longer embedded into the kernel, dramatically reducing size. The initrd is found from the DTB. 
- **Remove DTB location symbol in linker script**
- Shared memory ref-count fix from `v1.0.1`
- `lmsg` wrapper clobber list fix from `v1.0.1`
- **Fix data aborts from userspace panicking the kernel:** A stray case in the data abort handler caused the kernel to panic despite the exception trapping from user mode, this is now fixed.

### zuzu v1.2

- `MemUnmapRange` syscall (specifically for POSIX)
- Memory pressure notification
- OOM handler
- Priority inheritance on `MsgCall`
- Get rid of bump pointers in userspace memory reserval

### zuzu v1.3

- Kernel data structure optimizations

## zuzu v2.0 Prowl

**Planned:** 

- Pinned MMIO ranges and framebuffers for DMA
- SHM adjustments for shared library support
- Kernel synchronization primitives, library implements  `ZuzuMonitor` and `ZuzuCritSec` on top
- HAL cleanup
- (possibly) RISC-V port
- (less possibly) x86_64+UEFI port via Limine
- Full PascalCase
- Revoke syscall (?)
- SetGrantable syscall (?)
- Thread suspend/inspect (?)
- Process state capability (for activity monitors) (?)
- Distributed node primitives
- Kernel data structure optimizations

## zuzu v3.0 Knead

**Planned:** SMP with `KernelLap` (global spinlock).

## zuzu v4.0 Pounce

**Planned:** Full SMP with object-granularity locking.
