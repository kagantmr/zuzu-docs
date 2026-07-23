---
name: tjoin
number: "0x0A"
group: task
signature: "(tid) -> exit_status or -err"
args:
  - {reg: r0, name: tid, desc: "TID of the thread to wait for"}
returns: "Exit code of the thread."
errors:
  - {code: ERR_BADARG, when: "The calling process doesn't own that thread"}
---

Wait for a thread to exit.
