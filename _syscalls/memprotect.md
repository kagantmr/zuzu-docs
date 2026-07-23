---
name: memprotect
number: "0x37"
group: memory
signature: "(addr, size, prot) -> 0 or -err"
args:
  - {reg: r0, name: addr, desc: "Base of the region"}
  - {reg: r1, name: size, desc: "Length to reprotect"}
  - {reg: r2, name: prot, desc: "New VM_PROT_* bits (W^X enforced)"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Region is PINNED or GUARD, request spans regions, or W^X violated"}
  - {code: ERR_NOPERM, when: "EXEC requested on MMIO"}
---

Change the protection of an existing mapping.
