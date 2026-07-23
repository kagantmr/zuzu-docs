---
name: port_create
number: "0x20"
group: handles
signature: "() -> handle or -err"
returns: "A port handle."
errors:
  - {code: ERR_NOMEM, when: "If the object or a handle slot cannot be allocated"}
---

Create a new port (message endpoint) owned by the caller.
