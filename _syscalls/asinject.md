---
name: asinject
number: "0x38"
group: memory
signature: "(args*) -> 0 or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to the injection struct; its first field is a caller-set size"}
returns: "0 on success."
errors:
  - {code: ERR_NOPERM, when: "For a non-privileged caller"}
  - {code: "ERR_BADPTR / ERR_BADARG", when: "For a bad struct"}
---

Fill a frozen process's address space from parsed ELF data. This is the privileged step between `pspawn` and `kickstart`.

## Pitfalls

Only the init process may call this. Ordinary processes spawn children by messaging init, not by calling `asinject` directly.
