---
name: grant
number: "0x23"
group: handles
signature: "(handle, pid) -> 0 or -err"
args:
  - {reg: r0, name: handle, desc: "Handle to transfer"}
  - {reg: r1, name: pid, desc: "PID of the receiving process"}
returns: "0 on success."
errors:
  - {code: ERR_BADHANDLE, when: "Source handle names no live entry"}
  - {code: ERR_NOENT, when: "No such target process"}
  - {code: ERR_NOMEM, when: "Target handle table is full"}
---

Transfer a handle of *any* type to another process, the generic capability-transfer primitive. The handle is inserted into the target's table.
