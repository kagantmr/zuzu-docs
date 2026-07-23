---
name: pkill
number: "0x08"
group: task
signature: "(task_handle) -> 0 or -err"
args:
  - {reg: r0, name: task_handle, desc: "Slot index of the task handle"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "The handle doesn't exist, isn't a task handle, or the process doesn't exist"}
---

Terminate a child process.

## Pitfalls

You cannot kill threads this way since `pkill` operates on whole processes.
