---
name: ntfn_wait
number: "0x26"
group: handles
signature: "(ntfn_handle, timeout_ms) -> bits or -err"
args:
  - {reg: r0, name: ntfn_handle, desc: "Handle of the notification"}
  - {reg: r1, name: timeout_ms, desc: "0 to poll, UINT32_MAX for infinite, otherwise a deadline in ms"}
returns: "The accumulated bits (31-bit; bit 31 is reserved so a negative return is always an error)."
errors:
  - {code: ERR_TIMEOUT, when: "On a deadline or empty poll"}
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "For a bad handle"}
---

Block until a notification has bits set, then read and clear them.
