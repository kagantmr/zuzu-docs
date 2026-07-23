---
name: irq_bind
number: "0x41"
group: irq
since: "1.0"
blocking: no
signature: "(dev_handle, ntfn_handle) -> 0 or -err"
args:
  - {reg: r0, name: dev_handle, desc: "Handle of the device (from devmgr)"}
  - {reg: r1, name: ntfn_handle, desc: "Notification to signal on each interrupt"}
returns: "0 on success."
errors:
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "Bad device or notification handle"}
  - {code: ERR_BUSY, when: "Another process already owns that IRQ"}
  - {code: ERR_DEAD, when: "Notification object is dead"}
  - {code: ERR_BADARG, when: "Invalid IRQ number, or the device has no IRQ"}
see_also: [irq_done, ntfn_wait, ntfn_create, dev_query]
---

Bind a device's interrupt to a notification object. When the IRQ fires, the kernel masks the line and signals the notification; the driver waits on it with `ntfn_wait` or `waitany`. This folds in the old `irq_claim`. The IRQ sets bit `irq_num & 31`.

## Pitfalls

As of Loaf, **do not** bind two IRQs to a single notification. The 31st bit of the notification is reserved, **do not** bind any IRQs to it.
