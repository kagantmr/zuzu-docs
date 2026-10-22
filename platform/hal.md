---
layout: page
title: HAL & portability
section: Platform
prowl:
  - {title: "Porting an architecture", url: "/zuzu-docs/2.x/guides/porting-arch/"}
---

zuzu is written for one architecture today (ARMv7-A) but keeps the architecture-specific code behind a **hardware abstraction layer** so that other architectures can be added. The goal of the layer is that nothing under `kernel/` includes anything architecture-specific except through `arch/include/arch/`.

## Layout

```
arch/
├── include/arch/      // the HAL interface: what the kernel calls
└── arm/               // the ARMv7-A implementation
    ├── boot/          // _start.S, the very first instructions
    ├── early.c        // boot-time setup before the kernel proper
    ├── mmu/           // page tables, ASIDs, the L2 page pool
    ├── exceptions/    // vectors, entry, context switch
    ├── irq/           // GICv2 driver
    ├── timer/         // ARM generic timer
    ├── dtb/           // per-board device trees
    └── vfp.S          // lazy FPU switching
bsp/arm/<board>/       // per-board layout, linker script, defconfig
```

## The interface

The `arch/include/arch/` headers cover:

| Header | Responsibility |
|---|---|
| `mmu.h`, `asid.h` | build and switch address spaces, map pages, TLB maintenance |
| `cache.h`, `barrier.h`, `atomic.h` | cache and memory ordering primitives |
| `context.h`, `thread.h`, `regs.h`, `tls.h` | saved registers, context switch, thread pointer |
| `irq.h`, `cpu.h` | interrupt controller, IRQ masking, `wfi` |
| `timer.h`, `cycles.h` | monotonic timer and cycle counter |
| `fpu.h` | lazy floating-point switching |
| `syscall.h` | how the syscall ABI maps onto registers |
| `platform.h`, `symbols.h` | board-level hooks, linker symbols |

Kernel code calls these as `ArchTimerNow()`, `ArchTimerSetDeadline()`, `arch_set_thread_ptr()`, and so on, and the ARM implementation provides them.

## Boards

A board is a directory under `bsp/<arch>/<board>/` with its memory layout, boot header, linker script and default configuration, plus a device tree under `arch/<arch>/dtb/`. Selecting a board is the `BOARD=` variable of the build. See [Supported boards]({{ '/platform/supported-boards/' | relative_url }}) and the [porting guide]({{ '/platform/porting-guide/' | relative_url }}).

## Status

The HAL boundary exists but is not yet strict: some architecture assumptions (ARM-mode syscalls, 32-bit pointers, the `TTBR` split) still show through. A cleanup to make porting to other architectures straightforward is planned for a later zuzu release, which is why [porting]({{ '/platform/porting-guide/' | relative_url }}) is discouraged for now.
