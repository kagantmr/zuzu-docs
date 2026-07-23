---
name: ntfn_signal
number: "0x25"
group: handles
signature: "(ntfn_handle, bits) -> 0 or -err"
args:
  - {reg: r0, name: ntfn_handle, desc: "Handle of the notification"}
  - {reg: r1, name: bits, desc: "Bitmask to OR in (31-bit; bit 31 is reserved and rejected)"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Bit 31 was set"}
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "Bad or non-notification handle"}
---

Set bits on a notification object, waking any waiter. Bits accumulate until consumed.
