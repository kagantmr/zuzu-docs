---
name: TQuit
number: "0x0B"    
group: task
since: "1.0"
blocking: no
signature: "(status) -> never returns"
args:
  - {reg: r0, name: status, desc: "Exit status, readable by a joiner via `TJoin`"}
returns: "Does not return."
see_also: [TMake, TJoin, PQuit]
---

Terminate the calling thread. Its status is delivered to any thread blocked in `TJoin` on
it.

If it is the last thread in the process, the whole process exits (equivalent to `PQuit`
with the same status).

## Pitfalls

There is no way to terminate another thread. A thread ends only by returning from its entry
or calling `TQuit` itself since threads within a process share an address space and a trust
domain, so there is no boundary for a cross-thread kill to enforce. Asynchronous thread
termination, if ever needed, would come through a future suspend/inspect primitive, not a
peer-to-peer kill.