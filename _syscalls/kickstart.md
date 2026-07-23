---
name: kickstart
number: "0x07"
group: task
signature: "(args*) -> 0 or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to the argument struct"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Struct copy or handle lookup failed, the task is not frozen, or there is no such task"}
  - {code: ERR_BADPTR, when: "Struct pointer is invalid"}
---

Mark a FROZEN process as schedulable.

## Pitfalls

Do not `kickstart` a process whose address space has not been filled by `asinject`, or it takes a prefetch abort and is killed. Ordinary processes cannot call `asinject`; to spawn a child, message the init process.
