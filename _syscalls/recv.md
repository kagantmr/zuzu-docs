---
name: recv
number: "0x11"
group: messaging
since: "1.0"
blocking: conditional
signature: "(port, timeout_ms) -> source; r1–r3 payload"
args:
  - {reg: r0, name: port, desc: "Handle of the port to receive on"}
  - {reg: r1, name: timeout_ms, desc: "`TIMEOUT_POLL` to poll, `TIMEOUT_INFINITE` to block indefinitely, otherwise a deadline in ms"}
returns: "r0 = source (see below); r1–r3 = payload words."
errors:
  - {code: ERR_TIMEOUT, when: "Deadline expired, or a poll found no sender waiting"}
  - {code: ERR_BADHANDLE, when: "Handle names no live port"}
  - {code: ERR_BADTYPE, when: "Handle is not a port"}
  - {code: ERR_DEAD, when: "The port was destroyed while waiting"}
see_also: [send, call, reply, waitany]
---

Block waiting for a message on a port, returning once a sender rendezvouses.

What lands in `r0` depends on how the sender sent. A plain `send` puts the sender's PID in
`r0`. A `call` puts a freshly minted reply handle in `r0` and the sender's PID in `r1` and the server answers with `reply` on that handle. 
Check your protocol's convention to know which to expect.