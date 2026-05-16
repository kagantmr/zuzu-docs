---
layout: default
title: ZuzuOS
---

# ZuzuOS

ZuzuOS is a from-scratch ARMv7-A microkernel written in C and ARM assembly. It runs on QEMU's `vexpress-a15` (Cortex-A15) with ports to Raspberry Pi 4 (32-bit) and STM32 planned. The project is named after Zuzu, a Scottish Fold cat.

The kernel keeps only what belongs in privileged space — address space management, thread scheduling, IPC message passing, and interrupt forwarding. Everything else (device drivers, filesystem, network stack) runs as isolated userspace server processes that communicate exclusively via IPC.

---

## The OS family

| Variant | Target | Analog | Status |
|---------|--------|--------|--------|
| **ZuzuOS** | Cortex-A, full MMU | seL4 / QNX | active |
| **tinyZuzu** | Cortex-M, MPU | FreeRTOS | planned |
| **tinyZuzuRT** | Cortex-M, MPU, hard RT | VxWorks | planned |

---

## Status

| Phase | Name | Status |
|-------|------|--------|
| 0–9   | Build, boot, UART, PMM, DTB, heap, MMU, GIC, scheduler | <span class="badge badge-done">done</span> |
| 10    | Per-process address spaces, L2 tables, TTBR0/TTBR1 | <span class="badge badge-done">done</span> |
| 11    | User mode (USR), privilege separation | <span class="badge badge-done">done</span> |
| 12    | Syscall ABI, SVC dispatch | <span class="badge badge-done">done</span> |
| 13    | Synchronous IPC — send, recv, call, reply | <span class="badge badge-done">done</span> |
| 14    | IRQ forwarding to userspace | <span class="badge badge-done">done</span> |
| 15    | MMIO mapping, userspace device drivers | <span class="badge badge-done">done</span> |
| 16    | ELF loader, initrd, CPIO | <span class="badge badge-done">done</span> |
| 17    | C runtime, crt0, libzuzu | <span class="badge badge-done">done</span> |
| 18    | Name server (sysd), service registry | <span class="badge badge-done">done</span> |
| 19    | Advanced VMM — demand paging, shared memory | <span class="badge badge-done">done</span> |
| 20    | Process lifecycle — spawn, waitpid, process tree | <span class="badge badge-done">done</span> |
| 21    | Filesystem server (fat32d, zusd, fbox) | <span class="badge badge-done">done</span> |
| 22    | NIC driver (LAN9118) | <span class="badge badge-wip">next</span> |
| 23–25 | Network stack — ARP, IPv4, UDP, TCP | <span class="badge badge-planned">planned</span> |
| 26    | Hardening, ASIDs, stack guards | <span class="badge badge-wip">in progress</span> |

---

## Source

```
github.com/kagantmr/zuzu
```

Built with `arm-none-eabi-gcc`, tested on QEMU 10.1.2.
