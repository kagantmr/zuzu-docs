---
name: port_create
number: "0x20"
group: handles
since: "1.0"
blocking: no
signature: "() -> handle or -err"
returns: "A port handle."
errors:
  - {code: ERR_BADARG, when: "No calling thread context"}
  - {code: ERR_NOMEM, when: "No free handle slot, or the endpoint object could not be allocated"}
see_also: [msg_send, msg_recv, grant, destroy]
---

Create a new port (message endpoint) owned by the caller.
