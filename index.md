---
layout: page
title: zuzu
---

zuzu is a lightweight microkernel written from scratch in C and ARM assembly. It is named after zuzu,
the Scottish Fold cat.

As a microkernel, zuzu provides only the most essential services such as memory management, inter-process
communication, and scheduling.
Higher-level services such as device drivers, filesystems, and network stacks are implemented in userspace.
This design allows for better modularity, security, and reliability. zuzu prioritizes use in embedded
systems,
IoT devices, and other resource-constrained environments.

## Components

zuzu ships as two independently versioned parts. The kernel defines and enforces the [syscall ABI]({{ '/abi/syscall-abi/' | relative_url }}); the system is a consumer of it and floats on any kernel of a
compatible major.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Component</th>
<th>Scope</th>
<th>Version</th>
</tr>
</thead>
<tbody>
<tr>
<td>zuzu</td>
<td>Kernel: memory, scheduling, IPC, IRQ forwarding, ABI</td>
<td>Loaf (1.0)</td>
</tr>
<tr>
<td>zuzuOS</td>
<td>Kernel + userspace: drivers, servers, runtime, shell</td>
<td>0.5.0-beta</td>
</tr>
</tbody>
</table>
</div>

## Status

### zuzu (kernel)

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Stage</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr>
<td>Build, boot, UART, PMM, DTB, heap, MMU/VMM, GIC, scheduling</td>
<td>done</td>
</tr>
<tr>
<td>Process lifecycle, user mode, syscalls, synchronous IPC, notification objects</td>
<td>done</td>
</tr>
<tr>
<td>IRQ forwarding, userspace MMIO mapping, ELF loader, shared memory</td>
<td>done</td>
</tr>
<tr>
<td>HAL solidification, DMA pinning, kernel sync primitives</td>
<td>planned</td>
</tr>
<tr>
<td>Shared libraries (.zxf/.zcl), multicore primitives</td>
<td>planned</td>
</tr>
<tr>
<td>Ports to new architectures, full SMP</td>
<td>planned</td>
</tr>
</tbody>
</table>
</div>

### zuzuOS (userspace)

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Stage</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr>
<td>Core servers: sysd, devmgr, pl011drv</td>
<td>done</td>
</tr>
<tr>
<td>Read-only storage stack (fat32d, zusd, fbox)</td>
<td>done</td>
</tr>
<tr>
<td>NIC driver (LAN9118, userspace)</td>
<td>done</td>
</tr>
<tr>
<td>Network stack (ARP, IPv4, ICMP, UDP, TCP)</td>
<td>next</td>
</tr>
<tr>
<td>Sherbet release: POSIX shim, thesis demos</td>
<td>planned</td>
</tr>
<tr>
<td>Raspberry Pi 4 support, cellular connectivity</td>
<td>planned</td>
</tr>
<tr>
<td>Audio, graphics, optimizations</td>
<td>planned</td>
</tr>
</tbody>
</table>
</div>

## Quick start

```
git clone https://github.com/kagantmr/zuzu
cd zuzu
make
make run
```

Requires `arm-none-eabi-gcc`, `qemu-system-arm`, and `cpio`. Tested on QEMU
10.1.2.

## Where to start reading

New here? [Architecture]({{ '/kernel/architecture/' | relative_url }}) gives the whole picture in one page.
For the kernel interface, read the [Syscall ABI]({{ '/abi/syscall-abi/' | relative_url }}) and its
[table]({{ '/abi/syscall-table/' | relative_url }}). The [roadmap]({{ '/project/roadmap/' | relative_url }}) tracks what is
landing next.

zuzu is a solo thesis project, and reviewers and contributors are welcome. The kernel ABI is
frozen at Loaf, so userspace work has a stable surface to build against. Start with an issue
on [GitHub](https://github.com/kagantmr/zuzu).
