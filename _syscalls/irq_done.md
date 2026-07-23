---
name: irq_done
number: "0x42"
group: irq
since: "1.0"
blocking: no
signature: "(dev_handle) -> 0 or -err"
args:
  - {reg: r0, name: dev_handle, desc: "Handle of the device"}
returns: "0 on success."
errors:
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "For a bad handle"}
  - {code: ERR_BADARG, when: "Handle does not point to a valid IRQ"}
  - {code: ERR_NOPERM, when: "Calling process does not own the IRQ"}
see_also: [irq_bind, ntfn_wait, ntfn_create, dev_query]
---

Signal that the device has been serviced. The kernel unmasks the IRQ line so it can fire again. 

## Pitfalls

Do not call `irq_done` until the device has actually been serviced and has deasserted the line, or you provoke an interrupt storm. Recalling it is fine, since the kernel ignores it if the IRQ is not masked.
