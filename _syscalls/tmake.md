---
name: tmake
number: "0x09"
group: task
signature: "(entry, user_sp, arg) -> tid"
args:
  - {reg: r0, name: entry, desc: "Entry point (must be void (*entry)(void *))"}
  - {reg: r1, name: user_sp, desc: "User stack pointer (base)"}
  - {reg: r2, name: arg, desc: "Argument pointer passed to the entry function"}
returns: "Thread ID (TID) of the new thread."
errors:
  - {code: ERR_BADPTR, when: "Any of the three pointers are invalid"}
  - {code: ERR_NOMEM, when: "Failed to allocate the kernel stack or TCB"}
---

Create a new thread in the calling process.
