---
name: call
number: "0x12"
group: messaging
since: "1.0"
blocking: yes
signature: "(port, w1, w2, w3) -> r0–r3 reply"
args:
  - {reg: r0, name: port, desc: "Handle of the server port"}
  - {reg: "r1–r3", name: "w1–w3", desc: "Request payload words"}
returns: "r0–r3 = the reply words."
errors:
  - {code: ERR_BADHANDLE, when: "Handle names no live port"}
  - {code: ERR_BADTYPE, when: "Handle is not a port"}
  - {code: ERR_DEAD, when: "The peer is gone"}
see_also: [send, recv, reply, lcall]
---

Atomic send-then-receive: deliver a message and block for the reply on the same port. This is the request/response fast path, cheaper than a separate `send` + `recv`.

## Pitfalls

Deadlock is possible if the server is waiting for a message from the caller. Design your protocol to avoid circular waits, as zuzu by itself
provides minimal deadlock detection to userspace.