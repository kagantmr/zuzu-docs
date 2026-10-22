---
layout: page
title: Processes & threads
section: Kernel
prowl:
  - {title: "Spaces and tasks", url: "/zuzu-docs/2.x/concepts/spaces-tasks/"}
---

A zuzu **process** is an address space, a handle table, and one or more **threads** that run inside it. Processes are created frozen by their parent and become schedulable when started.

## Process

Each process has:

- a **PID** (up to 512 live processes) and its parent's PID;
- an address space: a level-1 translation table, a list of mapped regions, and an ASID-tagged TLB identity;
- a handle table, which is the complete list of things the process may touch;
- a 32-bit **label** the kernel attests to (set once, by init);
- an exit status, and lists of child processes and threads.

Two flags mark privileged processes: `PROC_FLAG_INIT` for PID 1 and `PROC_FLAG_DEVMGR` for the process that holds hardware authority.

## Creating a process

Spawning is a three-step sequence:

1. `PSpawn` creates a **frozen** process with an empty address space, and hands back a task handle and the PID.
2. `AsInject` fills the address space from a parsed ELF/ZXF image. This call is restricted to init.
3. `Kickstart` marks the process schedulable.

The child inherits the first four handle slots of its parent, so it starts out with the name server in slot 0. Normal processes spawn children by asking init rather than driving the sequence.

## Threads

A process may have up to 255 threads. Each is a `Thread` with its own kernel stack, saved registers and state (`READY`, `RUNNING`, `BLOCKED`, `ZOMBIE`, or `FROZEN`). `TMake` creates a thread in the caller's process; `TQuit` ends it and `TJoin` waits for it. A thread ID is only meaningful inside its process.

Every thread owns a slot in the process's TCB pages. A slot is 576 bytes: a 64-byte header (thread-local pointer, ids) followed by the 512-byte long-message buffer. Seven slots fit in a page and the kernel maps the pages into the process at user-visible addresses. The thread pointer register, `TPIDRURO`, points at the slot.

## Exit and reaping

`PQuit` ends the calling process; `PKill` ends a child through its task handle. Either way the process becomes a zombie with an exit status, its threads and mappings are torn down, and it is freed from the idle thread. A parent collects the status with `Wait`.

## Spawn limits

| Limit | Value |
|---|---|
| Processes | 512 |
| Threads per process | 255 |
| Kernel-wide thread IDs | 1024 |
| Waitany handles | 16 |
