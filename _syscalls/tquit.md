---
name: tquit
number: "0x0B"
group: task
signature: "(status) -> never returns"
args:
  - {reg: r0, name: status, desc: "Thread exit code"}
returns: "Does not return."
---

Terminate the calling thread. If it is the last thread, behaves like `pquit`.
