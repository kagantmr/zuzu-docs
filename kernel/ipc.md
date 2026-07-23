---
layout: page
title: Inter-process messaging (IPC)
section: Kernel
---

A microkernel's strength comes from IPC. Its speed determines the speed of the whole operating system. zuzu employs four different IPC
primitives for different use cases: register message passing (`msg`), long message passing (`lmsg`), asynchronous
notifications (`ntfn`), and shared memory (`shm`). Each of these is described in detail below.

## Message passing

Processes can talk to each other by passing messages from endpoints they create via the `port_create` syscall. When two processes
have the same endpoint object in their handle table, they can send messages of varying lengths to each other. zuzu implements the SRCR message model.

### Standard message passing

Using the `msg_send, msg_recv, msg_call, msg_reply` syscalls, processors can send 12-16 bytes of payload into the receiver's CPU registers.
The process wakes up with the data already in its registers. Future zuzu versions will also involve timeslice donation to speed up the cycle.

### Long message passing

After writing to the lmsg buffer dedicated for the thread (one can read it from the TPIDRURO register) using the `msg_lsend, msg_lcall, msg_lreply`
syscalls will copy up to 512 bytes of data from the sender to the recipient's lmsg buffer. The recipient can then read the data from its own lmsg buffer. This is useful for sending larger messages like strings without having to use shared memory.

## Shared memory

Processes can share memory by creating a shared memory object via the `shm_create` syscall. The kernel will allocate a page-aligned frame and map it into the address space of both processes. The processes can then read and write to the shared memory region directly, without going through the kernel. This is useful for sharing large amounts of data between processes without the overhead of message passing.

## Asynchronous notifications

Processes can communicate asynchronously via notifications using the `ntfn_signal, ntfn_wait` syscalls. The recipient process can create a notification object via the `ntfn_create` syscall. When a notification is sent, the kernel will wake up the recipient process and invoke its notification handler. This is useful for signaling events between processes without blocking.
