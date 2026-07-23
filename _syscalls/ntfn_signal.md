---
name: ntfn_signal
number: "0x25"
group: handles
since: "1.0"
blocking: no
signature: "(ntfn_handle, bits) -> 0 or -err"
args:
  - {reg: r0, name: ntfn_handle, desc: "Handle of the notification"}
  - {reg: r1, name: bits, desc: "Bitmask to OR in. Bit 31 is reserved and rejected"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Bit 31 was set"}
  - {code: ERR_BADHANDLE, when: "No such handle"}
  - {code: ERR_BADTYPE, when: "Handle is not a notification"}
  - {code: ERR_DEAD, when: "The notification object is dead"}
see_also: [ntfn_wait, ntfn_create, waitany, irq_bind]
---

Set bits on a notification object, waking one waiter if any is queued. Bits are OR'd into the
object's word and accumulate until consumed.

Bit 31 is reserved because the bits are returned in `r0`, where a negative value means an
error. Rejecting it keeps every successful return non-negative.

## Pitfalls

Delivery clears the whole word, and only one waiter is woken. If two threads wait on the same
notification, the first takes every accumulated bit and the second sees nothing. Use one notification per waiter.