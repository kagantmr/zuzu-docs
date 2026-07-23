---
layout: page
title: Architecture
section: Kernel
---

zuzu is a microkernel. The kernel runs at PL1 (SVC mode) and does the minimum necessary to support isolated userspace processes.

<div class="table-wrap">
<table>
<thead><tr><th>In the kernel (PL1)</th><th>In userspace (PL0)</th></tr></thead>
<tbody>
<tr><td>Address space management</td><td>Device drivers (zuart, zusd)</td></tr>
<tr><td>Thread and process scheduling</td><td>Filesystem server (fat32d, fbox)</td></tr>
<tr><td>IPC message passing</td><td>Network stack (Phase 22+)</td></tr>
<tr><td>Interrupt forwarding</td><td>Init / service registry (sysd)</td></tr>
<tr><td>Minimal fault handling</td><td>Shell (zzsh)</td></tr>
</tbody>
</table>
</div>

<hr>

## Memory map

```
0xFFFFFFFF ┌─────────────────────┐
           │   Kernel stacks     │
0xF0100000 ├─────────────────────┤
           │   MMIO region       │  (ioremap area)
0xF0000000 ├─────────────────────┤
           │   (unmapped guard)  │
           ├─────────────────────┤
           │   Kernel BSS/data   │
           │   Kernel text       │
0xC0000000 ├─────────────────────┤  ← KERNEL_VA_BASE
           │                     │
           │   User space        │  (per-process, switched via TTBR0)
           │   User stack ↓      │
           │   User heap ↑       │
           │   User text/data    │
           │                     │
0x00001000 ├─────────────────────┤
           │   NULL guard page   │
0x00000000 └─────────────────────┘
```

The ARM MMU uses two translation table base registers simultaneously. `TTBR1` holds the kernel's L1 table and never changes. `TTBR0` holds the current process's L1 table and is swapped on every context switch. The split boundary (`TTBCR.N = 1`) sits at `0xC0000000`.

<hr>

## Server hierarchy

```
sysd (PID 1)  ── name server + service registry
  │
  ├── devmgr (PID 2)  ── hardware authority, device enumeration
  │     ├── zuart  ── PL011 UART driver
  │     └── zusd   ── PL181 SD card driver
  │
  ├── fat32d  ── FAT32 filesystem (talks to zusd via IPC)
  ├── fbox    ── VFS IPC layer (talks to fat32d)
  │
  └── zzsh    ── shell
```

Processes discover each other through `sysd`'s name table. A server registers its port under a name; clients look it up at startup. No hardcoded port numbers anywhere in userspace.

<hr>

## Key design decisions

### SVC immediate as syscall number

The syscall number is encoded in the lower 8 bits of the `SVC #n` immediate field rather than a register (Linux uses `r7`). Arguments pass in `r0–r3` per AAPCS — no register shuffling required at the call site. This commits the ABI to ARM mode; Thumb `SVC` has only 8 usable bits and would need different extraction logic.

### TTBR0/TTBR1 split

Kernel mappings live in `TTBR1` and are always accessible regardless of which process is running. `TTBR0` switches per context switch. This eliminates per-process kernel mapping copies and makes the kernel permanently visible without TLB pressure.

### Synchronous rendezvous IPC

`send` blocks until a receiver is ready; `recv` blocks until a sender arrives. When both are present, the kernel copies four registers (`r0–r3`) and unblocks both. No message queues, no heap allocation in the IPC fast path. This is the same model used by L4, seL4, and QNX Neutrino.

### IPC as mutex

Synchronous IPC naturally serializes access to server state. A single-threaded server process cannot be re-entered while handling a request, which eliminates the need for explicit locking in most server designs. This mirrors QNX Neutrino's architecture.

### Capability model

Userspace never sees raw kernel pointers. Every kernel object (port, notification, shared memory region, thread) is referenced by a slot index into a per-process handle table. Possession of a valid handle slot equals permission. Userspace only ever sees integers.
