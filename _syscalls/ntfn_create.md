---
name: ntfn_create
number: "0x21"
group: handles
since: "1.0"
blocking: no
signature: "() -> handle or -err"
returns: "A notification handle."
errors:
  - {code: ERR_NOMEM, when: "No free handle slot, or the object could not be allocated"}
see_also: [ntfn_signal, ntfn_wait, waitany, irq_bind, destroy, grant]
---

Create a new notification object: a lightweight, non-blocking signal carrier used for IRQ
delivery and simple wakeups.

The object starts with no bits set and a reference count of one. The returned handle is
grantable, so a server can hand it to a client that needs to be woken.