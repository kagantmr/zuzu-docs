---
layout: doc
title: Architecture
section: Kernel
order: 1
---

# Architecture

ZuzuOS is a microkernel. The kernel runs at PL1 (SVC mode) and does the minimum necessary to support isolated userspace processes:

| In the kernel (PL1) | In userspace (PL0) |
|---|---|
| Address space management | Device drivers (zuart, zusd) |
| Thread and process scheduling | Filesystem server (fat32d, fbox) |
| IPC message passing | Network stack (Phase 22+) |
| Interrupt forwarding | Init / service registry (sysd) |
| Minimal fault handling | Shell (zzsh) |

Everything a monolithic kernel would do inside PL1 becomes a userspace server process here. Servers communicate exclusively through IPC — there are no shared kernel data structures visible to userspace.

---

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

The ARM MMU uses two translation table base registers simultaneously. `TTBR1` holds the kernel's L1 table and never changes. `TTBR0` holds the current process's L1 table and is swapped on every context switch. The boundary (`TTBCR.N = 1`) places the split at `0xC0000000`.

---

## Server hierarchy

```
sysd (PID 1) ── name server + service registry
  │
  ├── devmgr (PID 2) ── hardware authority, device enumeration
  │     ├── zuart ── PL011 UART driver
  │     └── zusd  ── PL181 SD card driver
  │
  ├── fat32d ── FAT32 filesystem (talks to zusd)
  ├── fbox   ── VFS IPC layer (talks to fat32d)
  │
  └── zzsh   ── shell
```

Processes discover each other through `sysd`'s name table rather than hardcoded port numbers. A server registers its port under a 4-byte name; clients look it up at startup.

---

## Key design decisions

**SVC immediate as syscall number.** The syscall number is encoded in the lower byte of the `SVC #n` immediate field rather than a register (Linux uses `r7`). Arguments pass in `r0–r3` per AAPCS — no register shuffling required. This commits the ABI to ARM mode (Thumb `SVC` has only 8 bits), which is an explicit tradeoff for a cleaner ABI.

**TTBR0/TTBR1 split.** Kernel mappings live in `TTBR1` and are always accessible regardless of which process is running. `TTBR0` switches per context switch. This eliminates per-process kernel mapping copies.

**Higher-half kernel.** The kernel lives at `0xC0000000` (physical `0x80000000`). User processes occupy `0x00000000–0xBFFFFFFF`.

**Synchronous rendezvous IPC.** `send` blocks until a receiver is ready; `recv` blocks until a sender arrives. When both are present, the kernel copies four registers (`r0–r3`) and unblocks both. No message queues, no heap allocation in the IPC fast path.

**IPC as mutex.** Synchronous IPC naturally serializes access to server state — a single-threaded server process cannot be re-entered. This eliminates the need for explicit locking in most server designs, mirroring QNX Neutrino's architecture.

**Capability model.** Userspace never sees raw kernel pointers. Every kernel object (port, notification, shared memory region, device handle, thread) is referenced by a slot index into a per-process handle table. Possession of a valid handle slot equals permission.
