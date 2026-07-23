---
name: grant
number: "0x23"
group: handles
since: "1.0"
blocking: no
signature: "(handle, pid) -> slot or -err"
args:
  - {reg: r0, name: handle, desc: "Handle to transfer"}
  - {reg: r1, name: pid, desc: "PID of the receiving process"}
returns: "The handle index in the grantee's table."
errors:
  - {code: ERR_BADHANDLE, when: "Source handle names no live entry"}
  - {code: ERR_BADARG, when: "No calling thread context"}
  - {code: ERR_NOMEM, when: "Grantee's handle table is full"}
  - {code: ERR_DEAD, when: "Grantee process is dead, or port/ntfn is dead and the handle was cleaned up"}
  - {code: ERR_NOENT, when: "Target PID is invalid"}
  - {code: ERR_NOPERM, when: "Handle is not grantable, target is the caller, or handle is a REPLY or TASK type"}
---

Copy a handle to another process. This is the generic capability-transfer primitive. The source keeps its handle and the object's refcount rises since this is a copy, not a move.

## Pitfalls

A received handle is non-grantable; only init can re-export. A capability therefore moves one hop from its origin, where origins are the kernel and whatever process created the object. The grantee gets no notification. Its table changes underneath it, so the granter must send the returned slot index over IPC.