---
title: zuzu
hide:
  - navigation
  - toc
---

<div class="zz-hero" markdown>
<img src="assets/favicon.png" alt="zuzu logo">
<div><h1 class="zz-name">zuzu</h1><span class="zz-tag">the microkernel</span></div>
</div>

zuzu is a lightweight microkernel written from scratch in C and ARM assembly. It is named after zuzu,
the Scottish Fold cat.

As a microkernel, zuzu provides only the most essential services such as memory management, inter-process
communication, and scheduling.
Higher-level services such as device drivers, filesystems, and network stacks are implemented in userspace.
This design allows for better modularity, security, and reliability. zuzu prioritizes use in embedded
systems, IoT devices, and other resource-constrained environments.

<div class="grid cards" markdown>

-   **Start**

    ---

    Build zuzu, boot it in QEMU or on a Raspberry Pi 4, write a first program.

    [Start here](start/index.md)

-   **Concepts**

    ---

    The five objects, handles, IPC, events, memory, scheduling and time.

    [Read the concepts](concepts/index.md)

-   **Reference**

    ---

    Every syscall, type and error code, generated from the headers.

    [Syscall table](reference/syscalls/index.md)

-   **zuzuOS**

    ---

    The userspace: boot, the name service, tty, fsd, netd, drivers, zzsh.

    [Explore zuzuOS](os/index.md)

</div>

!!! abstract "To write"
    Current versions (zuzu 2.0 Prowl, zuzuOS) and a one-line status per board.
