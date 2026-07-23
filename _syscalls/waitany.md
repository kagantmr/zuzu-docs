---
name: waitany
number: "0x17"
group: messaging
signature: "(handles*, count, timeout, result*) -> 0 or -err"
args:
  - {reg: r0, name: handles, desc: "Pointer to an array of handles to watch"}
  - {reg: r1, name: count, desc: "Number of handles in the array"}
  - {reg: r2, name: timeout, desc: "0 to poll, UINT32_MAX for infinite, otherwise a deadline in ms"}
  - {reg: r3, name: result, desc: "Pointer to the result struct; its first field is a caller-set size"}
returns: "0 on success, with the ready handle and its event written into result."
errors:
  - {code: ERR_TIMEOUT, when: "Deadline expired, or a poll found nothing ready"}
  - {code: ERR_BADPTR, when: "Handles or result pointer invalid"}
  - {code: ERR_BADARG, when: "Bad count or result size"}
---

Block until any one of several handles (ports or notifications) becomes ready. This is how a server multiplexes many clients and IRQ sources in a single loop.
