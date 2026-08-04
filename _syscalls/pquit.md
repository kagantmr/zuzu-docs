---
name: PQuit
number: "0x00"
group: task
since: "1.0"
blocking: no
signature: "(status) -> never returns"
args:
  - {reg: r0, name: status, desc: "Exit status stored in the PCB, retrievable by the parent via wait"}
returns: "Does not return."
see_also: [TQuit, PSpawn, PKill]
---

Terminate the calling process. The status is delivered verbatim to the parent through
`Wait`, with no kill tag: this is how a voluntary exit is distinguished from a `PKill` or
a fault death, which carry `KILLED_TAG`.

## Pitfalls

Do **not** use `PQuit` to exit a thread unless you want the thread to terminate the entire process. Use `TQuit` for a single thread. 