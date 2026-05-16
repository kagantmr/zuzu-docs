---
layout: doc
title: IPC
section: Kernel
order: 4
---

# IPC

*Full content coming. Key facts below.*

## Small-message IPC (4 registers)

Synchronous rendezvous. `send` blocks until receiver ready; `recv` blocks until sender arrives. Kernel copies `r0–r3` and unblocks both. No heap allocation in the fast path.

`SYS_PROC_CALL` is an atomic send+recv for request/response patterns.

## Bulk IPC (IPCX)

For payloads larger than 4 registers. Each process has an IPCX buffer (shared memory page). `_sendx(port, len)` copies into that buffer kernel-side before delivery. `_callx` / `_replyx` for request/response.

`channel.h` wraps IPCX into a three-function API: `chan_send`, `chan_call`, `chan_reply`.

## Multiplexed receive (recvany)

`SYS_PROC_RECVANY` blocks on an array of handles simultaneously — ports, notification objects, or a timeout. Returns which handle fired and what kind of event it was (send, call, IRQ, timeout). Used by servers that need to handle IPC and hardware events in the same loop.

## Ports

Named communication endpoints. `SYS_PORT_CREATE` returns a handle. `SYS_PORT_GRANT` gives another process the ability to send to it.

## Notification objects

Bitmask-based async signaling. `SYS_NTFN_SIGNAL` sets bits; `SYS_NTFN_WAIT` blocks until any bit is set and clears them. Used for intra-process thread wakeup (e.g., zusd and fbox worker threads) and IRQ delivery.

## den (IPC group membership)

A den is a set of PIDs that share a trust domain. Used by the name server to restrict which processes can register under a given name. Managed by `libzuzu/den.c`.
