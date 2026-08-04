---
layout: page
title: Markers & nametable
section: Kernel
---

Two small kernel-level conventions build on top of the plain [handle table]({{ '/kernel/handles/' | relative_url }}) and [ports]({{ '/kernel/ipc/' | relative_url }}): **markers**, which let one port stand in for many logical clients, and the **nametable**, the one well-known port every process starts with.

## Markers

A handle is a bare index; by itself it says nothing about who is on the other end of a
`MsgSend` or `MsgCall` beyond "some process holding a handle to this port." The [`Stamp`]({{ '/abi/syscall/stamp/' | relative_url }}) syscall lets a
server attach a **marker** — an opaque `uint32_t` badge — to a *new* handle that points at
the same underlying port:

```c
Handle plain = ZuzuPortCreate();
Handle badgeA = ZuzuStamp(plain, 1);   // new handle, same port, marker = 1
Handle badgeB = ZuzuStamp(plain, 2);   // new handle, same port, marker = 2
```

`plain`, `badgeA`, and `badgeB` all name the same `Port` object in the kernel; only the
`HandleEntry.marker` field differs between them. `Stamp` is non-consuming and the source
handle must be unmarked (`MARKER_NONE`, i.e. 0), so markers are always minted from the one
original handle, not from each other — a marked handle cannot itself be re-stamped
(`ERR_DUPLICATE`).

A server hands out `badgeA` to one client and `badgeB` to another (typically via `Grant`,
since a marked handle is exported the same way any handle is). Both clients `MsgSend`/`MsgCall`
into what looks, from their side, like an ordinary port. On the receiving end the server's
single `Waitany` loop sees the marker come back in `WaitanyResult.marker`, so it can tell the
two clients apart without opening a port per client or running a thread per client:

```c
WaitanyResult r;
ZuzuWaitany(handles, count, TIMEOUT_INFINITE, &r);
switch (r.marker) {
    case 1: /* handled badgeA's traffic */ break;
    case 2: /* handled badgeB's traffic */ break;
}
```

This is the same rendezvous IPC and the same `Waitany` multiplexing described in
[IPC]({{ '/kernel/ipc/' | relative_url }}) — markers add a demultiplexing axis on top,
without adding kernel objects. Marker `0` is reserved to mean "unmarked" and can never be
stamped onto a handle.

## Nametable

Slot 0 of every process's handle table is reserved for the **nametable port**: a handle to
the service registry that `sysd` listens on. The kernel creates this reservation lazily —
the first port the init process (`PROC_FLAG_INIT`) creates becomes the nametable port, and
the kernel back-fills handle slot 0 in every already-running process whose slot 0 is still
free. Every process spawned after that point gets slot 0 pre-populated by `PSpawn`, so it
can reach the nametable without any setup of its own.

Because slot 0 is a grantable handle to an ordinary port, "the nametable" is not a distinct
kind of kernel object — it is the one port that userspace has agreed, by convention, to
always find in the same place. Servers register a name by sending their own (typically
marked) port handle to `sysd` over it; clients look a name up the same way. See
[sysd]({{ '/os/sysd/' | relative_url }}) for the registration protocol itself.

## Pitfalls

A marker only distinguishes handles, not the underlying port: `Destroy` on any one of
`plain`, `badgeA`, or `badgeB` only frees that handle slot, and the port stays alive as long
as another handle (or the port's ref count) still holds it.

Only the init process may re-grant a *received* handle onward (`can_regrant_received_handle`
in the kernel), which keeps marker propagation bounded to one hop from whoever stamped the
handle — everyone else's copies are non-grantable.
