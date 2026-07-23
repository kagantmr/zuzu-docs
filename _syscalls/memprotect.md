---
name: memprotect
number: "0x37"
group: memory
since: "1.0"
blocking: no
headers: [zuzu/memprot.h, zuzu/types.h]
signature: "(addr, size, prot) -> 0 or -err"
args:
  - {reg: r0, name: addr, desc: "Base of the range. Must be page-aligned and in user space"}
  - {reg: r1, name: size, desc: "Length in bytes. Non-zero and a multiple of `PAGE_SIZE`"}
  - {reg: r2, name: prot, desc: "`VM_PROT_READ` / `VM_PROT_WRITE` / `VM_PROT_EXEC` only. W^X enforced"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Size of 0 or not a page multiple; range not valid user memory; W+X requested; or the range could not be reprotected"}
  - {code: ERR_NOPERM, when: "`prot` contains bits outside READ/WRITE/EXEC, including `VM_PROT_USER`"}
see_also: [memmap, memunmap]
---

Change the protection of an existing mapping. Unlike `memunmap`, this is a true range
operation: it takes an address and a length, and works at page granularity rather than
requiring a whole region.

The kernel ORs in `VM_PROT_USER` itself. Passing that bit explicitly is rejected.

## Pitfalls

W^X is enforced here as well as at `memmap`, so a region cannot be made writable and
executable by mapping it one way and reprotecting it another.

The underlying reprotect returns only success or failure, so every reason a range may be
refused — pinned or guard regions, spanning more than one region, changing a device mapping —
arrives as a single `ERR_BADARG`. The code does not distinguish them.