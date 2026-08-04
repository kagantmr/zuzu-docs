---
name: PortCreate
number: "0x20"
group: handles
since: "1.0"
blocking: no
signature: "() -> handle or -err"
returns: "A port handle."
errors:
  - {code: ERR_BADARG, when: "No calling thread context"}
  - {code: ERR_NOMEM, when: "No free handle slot, or the port object could not be allocated"}
see_also: [MsgSend, MsgRecv, Grant, Destroy, Stamp]
---

Create a new port (message endpoint) owned by the caller.
