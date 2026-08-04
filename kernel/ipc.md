---
layout: page
title: Inter-process messaging (IPC)
section: Kernel
---

A microkernel's strength comes from IPC. Its speed determines the speed of the whole operating system. zuzu employs four different IPC
primitives for different use cases: register message passing (`msg`), long message passing (`lmsg`), asynchronous
notifications (`ntfn`), and shared memory (`shm`). Each of these is described in detail below.

## Message passing

Processes can talk to each other by passing messages from ports they create via the `PortCreate` syscall. When two processes
have the same port object in their handle table, they can send messages of varying lengths to each other. zuzu implements the send/receive/call/reply message model.

A port handle can also be `Stamp`ed with a marker, minting a new handle to the same port that carries a caller-chosen marker.
This lets one port and one `Waitany` loop demultiplex many logical clients; see [Markers & nametable]({{ '/kernel/markers-nametable/' | relative_url }}).

### Standard message passing

Using the `MsgSend, MsgRecv, MsgCall, MsgReply` syscalls, processes can send up to 12 bytes of payload into the receiver's CPU registers.
The process wakes up with the data already in its registers. Future zuzu versions will also involve timeslice donation to speed up the cycle. It is the fastest form of IPC possible under zuzu, use it for small payloads. If the throughput is higher or there are medium-length data like strings being passed, consider using long message passing or shared memory.

### Long message passing

After writing to the lmsg buffer dedicated for the thread (one can read it from the `tdata_t` struct, whose pointer is in the `TPIDRURO` register) using the `MsgLsend, MsgLcall, MsgLreply` syscalls will copy up to 512 bytes of data from the sender to the recipient's lmsg buffer. The recipient can then read the data from its own lmsg buffer. This is useful for sending larger messages like strings without having to use shared memory, zuzuzuOS itself uses long message passing mostly for string passing. If the throughput is comparable to disk or network activity consider using shared memory.

## Shared memory

Processes can share memory by creating a shared memory object via the `ShmemCreate` syscall. The kernel will allocate page-aligned frames and map it into the address space of both processes. The processes can then read and write to the shared memory region directly, without going through the kernel. This is useful for sharing large amounts of data between processes without the overhead of message passing. Couple them with notifications for fast, asynchronous data transfer.

## Asynchronous notifications

Processes can communicate asynchronously via notifications using the `NtfnSignal, NtfnWait` syscalls. The recipient process can create a notification object via the `NtfnCreate` syscall. When a notification is sent, the kernel ORs the signaled bits into the notification object and wakes any thread waiting on it; the waiter returns with the accumulated bits. Used as a way to deliver IRQs from the kernel, future versions will allow processes to subscribe to other notifications regarding kernel state.

