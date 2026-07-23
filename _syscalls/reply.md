---
name: reply
number: "0x13"
group: messaging
signature: "(r0, w1, w2, w3) -> 0 or -err"
args:
  - {reg: "r0–r3", name: "reply words", desc: "The four reply words returned to the caller"}
returns: "0 on success."
errors:
  - {code: ERR_DEAD, when: "The caller is gone"}
---

Reply to the client currently blocked in a `call` on this server.
