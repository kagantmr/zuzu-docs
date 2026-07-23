---
name: irq_bind
number: "0x41"
group: irq
since: "1.0"
blocking: no
signature: "(dev_handle, ntfn_handle) -> 0 or -err"
args:
  - {reg: r0, name: dev_handle, desc: "Handle of the device (from dev_query)"}
  - {reg: r1, name: ntfn_handle, desc: "Notification to signal on each interrupt"}
returns: "0 on success."
errors:
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "Bad device or notification handle"}
  - {code: ERR_BUSY, when: "Another process already owns that IRQ"}
---

Bind a device's interrupt to a notification object. When the IRQ fires, the kernel masks the line and signals the notification; the driver waits on it with `ntfn_wait` or `waitany`. This folds in the old `irq_claim`.
