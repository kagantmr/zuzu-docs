---
name: pkill
number: "0x08"
group: task
since: "1.0"
blocking: no
signature: "(task_handle) -> 0 or -err"
args:
  - {reg: r0, name: task_handle, desc: "Slot index of a task handle from `pspawn`"}
returns: "0 on success."
errors:
  - {code: ERR_BADHANDLE, when: "No such handle, or the task has no live process or thread"}
  - {code: ERR_BADTYPE, when: "Handle is not a task handle"}
see_also: [pspawn, kickstart, pquit, wait]
---

Terminate a child process through its task handle. The process is killed unconditionally unlike `pquit`, which a process calls on itself, `pkill` is how a parent ends a child. The child exits with status `KILLED_TAG | KILL_BY_PARENT`, which the parent reads through `wait`.

The task handle is consumed: the parent's slot is freed as the process is killed.

## Pitfalls

This operates on whole processes. There is no way to kill an individual thread; a thread ends by returning from its entry point or calling `tquit`.