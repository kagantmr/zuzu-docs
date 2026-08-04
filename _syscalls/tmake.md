---
name: TMake
number: "0x09"
group: task
since: "1.0"
blocking: no
signature: "(entry, sp, arg) -> tid or -err"
args:
  - {reg: r0, name: entry, desc: "Thread entry point (user VA)"}
  - {reg: r1, name: sp, desc: "Top of the thread's user stack (caller-allocated)"}
  - {reg: r2, name: arg, desc: "Single argument passed to the entry function"}
returns: "The new thread's tid."
errors:
  - {code: ERR_BADPTR, when: "entry or sp is not a valid user address"}
  - {code: ERR_NOMEM, when: "No free thread, or no free TCB slot in the process"}
see_also: [TJoin, TQuit, PSpawn]
---

Create a thread in the calling process, sharing its address space and handle table. The
thread starts at `entry(arg)` on the stack you provide.

The caller owns the stack. `TMake` does not allocate one so pass the top of a region you
mapped yourself, and size it for the thread's needs.

The new thread gets its own TCB slot in the process's TCB page, so its `lmsg` buffer and
tid are reachable via the frozen `TPIDRURO -> ThreadData` path. A process is capped at
`TCB_MAX_SLOTS` (7) threads by that page.