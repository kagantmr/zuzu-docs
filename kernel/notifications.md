---
layout: page
title: Notifications
section: Kernel
prowl:
  - {title: "Events", url: "/zuzu-docs/2.x/concepts/events/"}
---

A **notification** is a 31-bit word that one party can signal and another can wait on. It is the only way to deliver asynchronous events in 1.x, including hardware interrupts. In 2.x notifications became **events**.

## Using one

```c
Handle n = NtfnCreate();
NtfnSignal(n, 1u << 3);                    // from anyone holding a handle to it
uint32_t bits = NtfnWait(n, TIMEOUT_INFINITE);
```

`NtfnCreate` returns a handle to a new notification owned by the calling process. The handle is grantable.

## Semantics

- `NtfnSignal(n, bits)` ORs `bits` into the notification's word. Bit 31 is reserved: a signal with it set fails with `ERR_BADARG`, because the result travels back in `r0` and negative values mean errors.
- If a thread is waiting, **one** waiter is woken and receives the accumulated word, and the word is cleared. Waiters are served in order.
- If nobody is waiting, the bits stay **pending** and the next wait returns them immediately without blocking.
- `NtfnWait(n, timeout)` returns the pending bits, blocks until a signal, or fails with `ERR_TIMEOUT` when the timeout expires. `TIMEOUT_POLL` never blocks.

Bits are not counted. Signaling the same bit twice before a wait looks like once, so treat a notification as "something happened" and keep the data itself in shared memory or another channel.

## Errors

| Error | When |
|---|---|
| `ERR_BADHANDLE` | the handle names nothing |
| `ERR_BADTYPE` | the handle is not a notification |
| `ERR_DEAD` | the notification was destroyed |
| `ERR_BADARG` | a signal used bit 31 |

## Interrupts

`IrqBind` ties a hardware interrupt to a notification and a bit: when the interrupt fires, the kernel masks it and signals that bit. The driver waits, services the device, then calls `IrqDone` to unmask it. Several interrupts can share one notification by using different bits, so one waiting thread can serve a whole driver.

## Waiting on several things

`Waitany` waits on up to 16 handles at once (ports and notifications) and reports which one fired, with the marker for a port. Together with markers it is how servers multiplex clients and interrupts in a single loop.

## Lifetime

A notification is reference counted. When the last handle is closed or its owner dies, waiters are woken with `ERR_DEAD`.
