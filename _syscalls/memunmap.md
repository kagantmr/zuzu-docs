---
name: memunmap
number: "0x31"
group: memory
signature: "(addr) -> 0 or -err"
args:
  - {reg: r0, name: addr, desc: "Base address of the region to unmap"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Addr is not the base of a mapped region"}
---

Unmap a whole region by its base address.

## Pitfalls

Whole-region only — you cannot unmap part of a mapping. Partial unmap is a planned additive call (`memunmap_range`) in a later 1.x kernel.
