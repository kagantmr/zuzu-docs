---
layout: page
title: Handles
section: Kernel
---

A handle is a small integer that names a kernel object. Userspace never sees
kernel pointers; every reference to an endpoint, a device, a shared memory
region or a task goes through the calling process's handle table, and the
kernel resolves the index to the real object.

This is the mechanism behind zuzu's central claim:

> Everything is a handle; possession is authority.

There are no permission checks against process identity when a handle is used.
If a process holds a handle to an object, it may use that object. Access
control happens at the moment a handle is *granted*, not each time it is
invoked.

## The handle table

Each process has one, allocated at `ProcessCreate` and destroyed with the
process. Entries are looked up by index; an index with no live object is
`HANDLE_FREE`.

```c
typedef struct {
    HandleType type;
    bool       grantable;
    uint32_t   marker;
    VirtAddr   mapped_va;
    union {
        Port      *port;
        Ntfn      *ntfn;
        ShmCap    *shm;
        DeviceCap *dev;
        ReplyCap  *reply;
        ProcessObj *task;
    };
} HandleEntry;
```

New handles are allocated at the lowest free index. Slot 0 is not reserved by
the kernel but it is reserved by *convention*, described below.

## Handle types

| Type | Object | Obtained from |
| --- | --- | --- |
| `HANDLE_PORT` | IPC endpoint | `PortCreate`, or granted by the owner |
| `HANDLE_NTFN` | notification | `NtfnCreate`, `IrqBind` |
| `HANDLE_SHM` | shared memory region | `ShmemCreate`, or granted |
| `HANDLE_DEVICE` | device capability (MMIO range + IRQ) | injected by the kernel into `devmgr`; granted onward from there |
| `HANDLE_TASK` | a process | `PSpawn`; seeded into `sysd` for kernel-loaded processes |
| `HANDLE_REPLY` | single-use right to answer a blocked caller | delivered by `MsgRecv`/`WaitAny` on a `MsgCall` |
| `HANDLE_FREE` | — | an empty slot |

`HANDLE_REPLY` is the odd one. It is created by the kernel, not requested;
consumed by `MsgReply`; and explicitly refused by `Grant`, so a reply right
cannot be handed to a third party.

## Granting

`Grant(handle, pid, flags)` copies an entry from the caller's table into the
target's table at the target's lowest free index, and returns that index to
the *grantor*. The grantor's own entry is untouched since granting is a copy, not
a transfer, and one holder can grant the same handle to any number of
processes.

Reference counts on the underlying object are incremented per handle, so the
object outlives any individual holder and is freed when the last handle to it
goes away.

### Regrantability

Whether the recipient may grant the handle onward is decided by the grantor,
per grant, through `GRANT_REGRANTABLE`:

```c
Grant(port, nameserver_pid, GRANT_REGRANTABLE);   /* nameserver may pass it on */
Grant(port, client_pid, 0);                       /* the chain stops here */
```

The flag governs **one hop of authority**, not a count. A holder with a
regrantable copy can distribute it freely; what it decides at each grant is
whether the *next* holder may continue. Propagation is therefore a deliberate
choice at every step rather than a property that sticks. This is what makes the nametable work: a service grants its port to the nameserver regrantably, the nameserver hands copies to any number of lookup clients non-regrantably, and the port stops there.

## Markers

`Stamp(handle, value)` returns a *new* handle to the same object carrying a
32-bit marker. The original is untouched since stamping is non-consuming. When a message arrives through a stamped handle, the receiver sees the marker in `WaitanyResult.marker`. This lets a server tell its clients apart without any lookup: it mints a distinctly-marked copy per client and demultiplexes on the marker.

Rules, frozen at 1.1:

- `MARKER_NONE = 0` means unmarked, and is the default forever.
- A marker can only be applied to an unmarked handle; re-stamping returns
  `ERR_DUPLICATE`.
- Markers are delivered on the `WaitAny` path only. `MsgRecv` carries no
  marker since there isn't any room on the AArch32 ABI.
- `Grant` copies the marker along with the rest of the entry.

A marker identifies *which channel* a message came through. It cannot identify
a caller that was never given a stamped handle, for that, see
[labels](#labels-and-first-contact).

## Slot conventions

The kernel allocates handles at the lowest free index and attaches no meaning
to any particular slot. The conventions below are enforced by `sysd`, not by
the kernel.

| Slot | Contents |
| --- | --- |
| 0 | the nameserver's port |
| 1–3 | inherited alongside slot 0; reserved for future well-known handles |

`PSpawn` copies slots 0–3 from the spawning process into the child. This is
how every process reaches the nameserver: `sysd` places it at its own slot 0
during boot, and every descendant inherits it.

Kernel-loaded processes are the exception. `devmgr` is created before `sysd`
runs, so it has no parent to inherit from and its device capabilities are
injected first — its nameserver handle therefore lands at whatever index was
free, and `sysd` passes that index at kickstart rather than assuming zero.

## Labels and first contact

Markers answer "which of my channels is this?", which presupposes the channel
already exists. On first contact a server has minted nothing, so every caller
looks identical. A **label** fills that gap. It lives on the process, not the handle, is set once by `sysd` in the frozen window before the process runs, and is delivered by the kernel in `WaitanyResult.label`. A server reads it to decide whether a cold caller deserves a privileged handle, and if so, mints a marked copy and grants it.

## Destroying

`Destroy(handle)` releases the caller's reference. For a `Port` or `Ntfn`,
only the owner may destroy the object itself; doing so wakes every blocked
peer with `ERR_DEAD`. Other holders' handles become stale and report
`ERR_DEAD` on next use.

`Destroy` refuses:

- `HANDLE_REPLY` which is consumed by `MsgReply`, never destroyed explicitly.
- A mapped `HANDLE_SHM` or `HANDLE_DEVICE` must be unmapped first, or the region is
  left dangling (`ERR_BUSY`).
- A `HANDLE_TASK` whose process is still alive (`ERR_BUSY`); the task must
  exit or be killed first, after which `Destroy` reaps it.

When a process dies, its whole table is torn down: ports it owns are marked
dead and their waiters woken, shared memory references are dropped, device
capabilities are released, and outstanding reply capabilities are revoked so
callers blocked on them are not stranded.
