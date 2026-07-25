---
name: tjoin
number: "0x0A"
group: task
since: "1.0"
blocking: yes
signature: "(tid) -> exit_status or -err"
args:
  - {reg: r0, name: tid, desc: "Thread ID to join, within the calling process"}
returns: "The joined thread's exit status."
errors:
  - {code: ERR_NOENT, when: "No thread with that tid exists"}
  - {code: ERR_NOPERM, when: "The thread belongs to another process"}
see_also: [tmake, tquit, wait]
---

Block until a thread in the same process exits, returning its exit status. If the thread
has already exited, returns its status immediately without blocking.

Only threads within the caller's own process can be joined since a tid is an identifier inside
a process, not a cross-process handle.

## Pitfalls

The exit status is returned directly in `r0`, in the same register the error codes use. A
thread that exits with a small negative status (e.g. `tquit(-2)`) is indistinguishable from
an error like `ERR_NOENT`. Reserve non-negative exit codes, or carry status out-of-band.