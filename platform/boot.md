---
layout: page
title: Boot sequence
section: Platform
prowl:
  - {title: "Boot", url: "/zuzu-docs/2.x/os/boot/"}
---

This is the path from power-on to a shell prompt on zuzu 1.x with zuzuOS 0.7.

## 1. Firmware and bootloader

Something outside zuzu loads three things into RAM and jumps to the kernel: the **kernel image**, a **device tree blob** (DTB), and the **initrd** (a CPIO archive of programs). On QEMU `vexpress-a15` that is U-Boot using `bootm`; on Raspberry Pi 4 it is the Pi firmware. The DTB's address arrives in `r2`, and the initrd location is read from the DTB `/chosen` node. A kernel without a bootloader-supplied initrd panics.

## 2. Early boot

`arch/arm/boot/_start.S` runs with the MMU off. It sets up a minimal stack and page tables, enables the MMU, and jumps to the kernel's linked high-half address. `arch/arm/early.c` then reads the DTB for memory size and the kernel is mapped at its final address; the identity mapping used during the switch is removed.

## 3. Kernel initialization

`kmain` runs, in order: the physical memory manager, the kernel heap, the scheduler, interrupts (GICv2) and the timer, the **syspage** (the read-only page that tells userspace about the machine), and the initrd. It then reads `boot.manifest` and spawns the boot programs.

## 4. Boot programs

The kernel itself starts only the programs the manifest marks with the roles `init` (sysd, which becomes PID 1) and `dev` (devmgr). For each device in the DTB it creates a device capability and injects it into devmgr. sysd is given devmgr's entry point and starts it. From here the kernel just schedules.

## 5. sysd takes over

sysd sets its own identity, starts the **nameserver**, then devmgr, reads the manifest again, and spawns the remaining programs from the initrd, giving each a label from its service path. It kickstarts them, waits for `/svc/devmgr`, waits for `/svc/fsd`, and finally starts the late programs (the shell). See [sysd]({{ '/os/sysd/' | relative_url }}).

## 6. Shell

`zzsh` looks up `/dev/uart0` and `/svc/fsd` and shows its prompt. Programs not in the initrd are loaded from the SD card through fsd and sysd.

## The manifest

`boot.manifest` is a plain text file in the root of the initrd, one entry per line:

```
# program|role[:flags][|service-path]
bin/sysd|init
bin/devmgr|dev
bin/nameserver|file
bin/pl011drv|tty|/dev/uart0
bin/fsd|none|/svc/fsd
bin/zzsh|tty:late|/env/zzsh
```

The manifest is per board and lives in `bsp/<arch>/<board>/boot.manifest`. A second one, `sd.manifest`, lists programs staged onto the SD card.

Add a line and rebuild the initrd to make something start at boot. The third field is the nametable path the program will own and the label it gets.

## Failure modes

- **No output at all:** the kernel UART (early console) is not up; check the DTB and board configuration.
- **`panic`:** the kernel prints a fault context and a symbolized backtrace. See [Debugging]({{ '/platform/debugging/' | relative_url }}).
- **Boots, but long pause:** sysd waits up to 30 seconds for `/svc/devmgr` or `/svc/fsd`; one of them did not start.
