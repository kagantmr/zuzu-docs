---
name: Wait
number: "0x03"
group: task
since: "1.0"
blocking: conditional
signature: "(pid, &status, flags) -> pid or -err"
args:
  - {reg: r0, name: pid, desc: "PID of the child to wait on, or -1 for any child"}
  - {reg: r1, name: "&status", desc: "Pointer the kernel fills with the child's exit status. May be null? — confirm"}
  - {reg: r2, name: flags, desc: "`WNOHANG` to return immediately if no child has exited"}
returns: "The PID of the reaped child, or 0 if WNOHANG and none had exited."
errors:
  - {code: ERR_BADARG, when: "PID is negative and not -1"}
  - {code: ERR_NOENT, when: "No matching child exists, or none became reapable"}
  - {code: ERR_BADPTR, when: "Status pointer is invalid"}
see_also: [PQuit, PKill, PSpawn, Kickstart]
---

Wait for a child to exit and reap it, reading back its exit status.

With a specific PID, waits on that child. With -1, waits on any child. Without `WNOHANG`
the call blocks until a matching child exits; with `WNOHANG` it returns 0 immediately if
none has. On success the child is reaped and its PID returned.

The status word carries how the child died:

- A clean exit holds whatever value the child passed to `PQuit`.
- A killed child holds `KILLED_TAG | reason`. Decode with `WAS_KILLED(status)` and
  `KILL_REASON(status)`: `KILL_BY_PARENT` for `PKill`, the `KILL_FAULT_*` family for a
  fault, `KILL_OOM` for an out-of-memory kill.

## Pitfalls

A child that exits but is never waited on stays a zombie until reaped. A parent that spawns
and kills children without ever calling `Wait` leaks them; a long-lived supervisor must
reap. If the parent dies first, its zombies reparent to pid 1, which reaps them.