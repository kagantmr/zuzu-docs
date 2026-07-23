---
name: pquit
number: "0x00"
group: task
signature: "(status) -> never returns"
args:
  - {reg: r0, name: status, desc: "Exit status stored in the PCB, retrievable by the parent via wait"}
returns: "Does not return."
---

Terminate the calling process.

## Pitfalls

Do **not** use `pquit` to exit a thread unless you want the thread to terminate the entire process. Use `tquit` for a single thread.
