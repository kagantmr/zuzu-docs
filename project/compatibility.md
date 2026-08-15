---
layout: page
title: Compatibility
section: Project
---

What zuzu runs on, and what it needs from the machine underneath it. For
version and ABI compatibility between releases, see [Versioning](versioning).

## Architecture

zuzu currently targets **ARMv7-A** — 32-bit, little-endian, MMU-equipped. The kernel
assumes:

- Two translation table base registers (`TTBR0`/`TTBR1`) with the split at
  `0xC0000000`, so the kernel mapping is permanent and only the user half is
  switched.
- A GICv2 interrupt controller.
- The ARM generic timer.
- ARM-mode userspace. The syscall ABI encodes the call number in the `SVC`
  instruction's 24-bit immediate, which Thumb's 8-bit immediate cannot hold —
  Thumb userspace is not supported, and this is a deliberate trade for a
  cleaner ABI with zero register overhead.

Other architectures are planned rather than present. ZXF reserves values for
AArch64, x86-64, ARMv7-M, RISC-V and PowerPC but nothing else is implemented.

## Boards

| Board | Status | Notes |
| --- | --- | --- |
| Raspberry Pi 4 (BCM2711, Cortex-A72) | primary target | real-silicon reference; all performance numbers come from here |
| vexpress-a15 (QEMU) | supported | correctness testing only |

Board differences live in per-board `layout.h` files — `KERNEL_PA_BASE` is
`0x80000000` on vexpress and `0x00000000` on rpi4 — and in DTB-driven device
discovery. `early.c` takes its memory map and peripheral addresses from the
device tree rather than compiled-in constants.

Known board-specific gaps are tracked as HAL work: an IRQ 34 fossil in the ARM
IRQ path and `devmgr`'s `class_to_compat()` board table are both still
hard-coded, and `sysd` has an outstanding failure on real rpi4 hardware.

### QEMU is for correctness only

Never take performance numbers from QEMU. It does not model the PMU, the
caches, or the TLB, and its cycle counter is not meaningful. Use it to check
that something boots, completes, and does not panic; measure on silicon. The reverse trap also exists: QEMU is permissive about memory attributes that real hardware is not. Test anything touching MMU or cache configuration on hardware before believing it.

## Bootloader

zuzu expects a bootloader to place a CPIO initrd in memory and describe it
through the device tree's `/chosen` node. Both u-boot's `bootm` and the Pi
firmware do this. The initrd's physical address is not assumed to be page-aligned, u-boot's `bootm` skips a 64-byte legacy image header, which is never page-sized so
the kernel maps the containing page and passes the exact offset to `sysd` through argv.

## Toolchain

| | |
| --- | --- |
| Compiler | `arm-none-eabi-gcc` |
| C library | newlib (bare-metal) |
| Emulator | QEMU (`qemu-system-arm`, vexpress-a15) |
| Debugger | `gdb` with the ELF build artifacts |
| Host scripts | Python 3 with `pyelftools`, for `elf2zxf` |

Release builds for rpi4 use `-mcpu=cortex-a72 -falign-functions=64 -O3 --lto`.
Binary compactness is a first-class goal, so `-Os` is used where size matters
more than speed.

Development hosts in use are macOS; the Makefile can currently be shaky.

### newlib limitations

The bare-metal newlib the toolchain ships has real gaps that affect what can
be ported: `dirent.h` is present but `#error`-guarded, `regex` is declared but
not implemented, and there is no networking layer at all. `fork` and `execve`
cannot be supported, because zuzuOS has no address-space duplication and
process creation goes through `PSpawn` -> `exec_inject` -> `Kickstart` instead.

See the [newlib tier](newlib-tier) for the full picture of what a port can and
cannot rely on.

## Not supported

- **SMP.** Single core only. Multiprocessing arrives with Knead (3.0); the
  kernel currently uses interrupt masking where a real spinlock would be
  needed on a second core.
- **Hardware floating point in the kernel.** VFP is lazily saved and restored
  for userspace; kernel code stays integer-only.
- **64-bit anything.** ARMv7-A is a 32-bit target; the 64-bit fields in ZXF
  are forward-looking.
