---
name: ntfn_wait
number: "0x26"
group: handles
since: "1.0"
blocking: conditional
signature: "(ntfn_handle, timeout_ms) -> bits or -err"
args:
  - {reg: r0, name: ntfn_handle, desc: "Handle of the notification"}
  - {reg: r1, name: timeout_ms, desc: "`TIMEOUT_POLL` to poll, `TIMEOUT_INFINITE` to block forever, otherwise a deadline in milliseconds"}
returns: "The accumulated bits. Always non-negative, since bit 31 cannot be set."
errors:
  - {code: ERR_TIMEOUT, when: "Deadline expired, or a poll found no bits set"}
  - {code: ERR_BADHANDLE, when: "No such handle"}
  - {code: ERR_BADTYPE, when: "Handle is not a notification"}
  - {code: ERR_DEAD, when: "The notification object is dead"}
see_also: [ntfn_signal, ntfn_create, waitany, irq_bind]
---

Read and clear a notification's bits, blocking until at least one is set.

If bits are already pending the call returns immediately with them, whatever the timeout. A
poll on an empty notification returns `ERR_TIMEOUT` rather than zero, so a successful return
always carries at least one bit.

Sub-millisecond timeouts are rounded up to a single tick rather than to zero, so a short
timeout never degenerates into a poll.

## Pitfalls

The read is destructive: bits are cleared on return, so there is no way to inspect them
without consuming them.

A waiter woken by `ntfn_signal` receives every bit accumulated at that moment, not only the
bits from the signal that woke it.