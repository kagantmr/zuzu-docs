---
layout: page
title: zuzu's Design
section: Kernel
---

zuzu is a microkernel. The kernel runs at PL1 (SVC mode) and does the minimum necessary to support isolated userspace processes.

<div class="table-wrap">
<table>
<thead><tr><th>In the kernel (PL1)</th><th>In userspace (PL0)</th></tr></thead>
<tbody>
<tr><td>Address space management</td><td>Device drivers</td></tr>
<tr><td>Thread and process scheduling</td><td>Filesystem server</td></tr>
<tr><td>IPC message passing</td><td>Network stack</td></tr>
<tr><td>Interrupt forwarding</td><td>Init / service registry</td></tr>
<tr><td>Minimal fault handling</td><td>Shell</td></tr>
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
0xC0000000 ├─────────────────────┤  <- KERNEL_VA_BASE
           │                     │
           │   User space        │  (per-process, switched via TTBR0)
           │   User stack ^      │
           │   User heap  v      │
           │   User text/data    │
           │                     │
0x00001000 ├─────────────────────┤
           │   NULL guard page   │
0x00000000 └─────────────────────┘
```

The ARM MMU uses two translation table base registers simultaneously. `TTBR1` holds the kernel's L1 table and never changes. `TTBR0` holds the current process's L1 table and is swapped on every context switch. The split boundary sits at `0x80000000`.

<hr>

## Server hierarchy


<hr>

## Design

