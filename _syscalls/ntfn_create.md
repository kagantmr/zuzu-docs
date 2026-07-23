---
name: ntfn_create
number: "0x21"
group: handles
signature: "() -> handle or -err"
returns: "A notification handle."
errors:
  - {code: ERR_NOMEM, when: "If the object or a handle slot cannot be allocated"}
---

Create a new notification object: a lightweight, non-blocking signal carrier used for IRQ delivery and simple wakeups.
