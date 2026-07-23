---
name: recv
number: "0x11"
group: messaging
signature: "(port, timeout_ms) -> sender; r1–r3 payload"
args:
  - {reg: r0, name: port, desc: "Handle of the port to receive on"}
  - {reg: r1, name: timeout_ms, desc: "TIMEOUT_POLL (0) for non-blocking, TIMEOUT_INFINITE to block indefinitely, otherwise a deadline in ms"}
returns: "r0 = sender PID; r1–r3 = the payload words."
errors:
  - {code: ERR_TIMEOUT, when: "Deadline expired, or a poll found nothing waiting"}
  - {code: ERR_BADHANDLE, when: "Handle names no live port"}
---

Block waiting for a message on a port. Returns the sender and payload once a sender rendezvouses.
