---
name: ShmemCreate
number: "0x32"
group: memory
since: "1.0"
blocking: no
signature: "(size) -> handle or -err"
args:
  - {reg: r0, name: size, desc: "Size of the shared region"}
returns: "A shared-memory handle."
errors:
  - {code: ERR_BADARG, when: "For a bad size"}
  - {code: ERR_NOMEM, when: "If frames or a handle slot cannot be allocated"}
see_also: [MemMap, MemUnmap, Destroy]
---

Create a shared-memory object and receive a handle to it. Map it with `MemMap`; hand it to a peer with `Grant`.
