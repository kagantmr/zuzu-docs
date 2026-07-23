---
name: shm_create
number: "0x32"
group: memory
signature: "(size) -> handle or -err"
args:
  - {reg: r0, name: size, desc: "Size of the shared region"}
returns: "A shared-memory handle."
errors:
  - {code: ERR_BADARG, when: "For a bad size"}
  - {code: ERR_NOMEM, when: "If frames or a handle slot cannot be allocated"}
---

Create a shared-memory object and receive a handle to it. Map it with `memmap`; hand it to a peer with `grant`.
