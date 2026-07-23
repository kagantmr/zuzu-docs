---
name: call
number: "0x12"
group: messaging
signature: "(port, w1, w2, w3) -> r0–r3 reply"
args:
  - {reg: r0, name: port, desc: "Handle of the server port"}
  - {reg: "r1–r3", name: "w1–w3", desc: "Request payload words"}
returns: "r0–r3 = the reply words."
errors:
  - {code: ERR_BADHANDLE, when: "As for send"}
  - {code: ERR_BADTYPE, when: "As for send"}
  - {code: ERR_DEAD, when: "As for send"}
---

Atomic send-then-receive: deliver a message and block for the reply on the same port. This is the request/response fast path, cheaper than a separate `send` + `recv`.
