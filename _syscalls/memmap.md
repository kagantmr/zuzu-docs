---
name: memmap
number: "0x30"
group: memory
signature: "(handle | HANDLE_ANON, size, prot, flags) -> va or -err"
args:
  - {reg: r0, name: handle, desc: "Object handle, or HANDLE_ANON for anonymous memory"}
  - {reg: r1, name: size, desc: "Anonymous: > 0 and ≤ 32 MB. Device/SHM: must be 0 (the object knows its size)"}
  - {reg: r2, name: prot, desc: "VM_PROT_READ/WRITE/EXEC only; W^X enforced; EXEC rejected on device"}
  - {reg: r3, name: flags, desc: "Must be 0"}
returns: "The virtual address of the mapping."
errors:
  - {code: ERR_BADARG, when: "Bad size, W+X prot, EXEC on a device, or non-zero flags"}
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "Handle is not a mappable object"}
  - {code: ERR_NOMEM, when: "Out of physical frames or virtual address space"}
---

Map memory into the caller. The first argument selects what backs it: `HANDLE_ANON` for fresh anonymous pages, or a shared-memory / device handle for an existing object. This one call replaces the old `attach` and `mapdev`.

## Pitfalls

The kernel ORs in `VM_PROT_USER` itself. a process cannot mint a kernel-privileged mapping through `prot`. See [Memory]({{ '/kernel/memory/' | relative_url }}) for the full model.
