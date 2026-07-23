---
name: wait
number: "0x03"
group: task
signature: "(pid, &status) -> 0 or -err"
args:
  - {reg: r0, name: pid, desc: "PID of the process to wait on"}
  - {reg: r1, name: "&status", desc: "Pointer to a buffer the kernel fills with the child's exit status"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Negative PID"}
  - {code: ERR_NOENT, when: "No process with that PID exists"}
  - {code: ERR_BADPTR, when: "Status pointer is invalid"}
---

Wait for a child process to exit.
