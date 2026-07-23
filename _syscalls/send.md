---
name: send
number: "0x10"
group: messaging
signature: "(port, w1, w2, w3) -> 0 or -err"
args:
  - {reg: r0, name: port, desc: "Handle of the destination port"}
  - {reg: "r1–r3", name: "w1–w3", desc: "The three payload words"}
returns: "0 on success."
errors:
  - {code: ERR_BADHANDLE, when: "Handle names no live port"}
  - {code: ERR_BADTYPE, when: "Handle is not a port"}
  - {code: ERR_DEAD, when: "The peer is gone"}
---

Send a three-word message to a port and block until a receiver takes it (synchronous rendezvous).
