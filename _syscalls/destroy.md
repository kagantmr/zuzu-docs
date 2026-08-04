---
name: Destroy
number: "0x24"
group: handles
since: "1.0"
blocking: no
signature: "(handle) -> 0 or -err"
args:
  - {reg: r0, name: handle, desc: "Handle of the object to destroy"}
returns: "0 on success."
errors:
  - {code: ERR_BADHANDLE, when: "Handle names no live entry"}
  - {code: ERR_BADTYPE, when: "Handle is a REPLY type, which destroy refuses"}
  - {code: ERR_BUSY, when: "Object is still mapped somewhere"}
  - {code: ERR_DEAD, when: "Port/ntfn owner is dead, and the handle was cleaned up"}
  - {code: ERR_NOPERM, when: "Calling process does not own the port/ntfn"}
see_also: [PortCreate, Grant]
---

Destroy the object behind a handle. Dispatches on the handle's type, so it replaces the old per-type destroy calls.

## Pitfalls

Unmap a shared-memory or device region with `MemUnmap` before destroying its handle, or you get `ERR_BUSY`. Same goes for task handles, if the process is still running while destroy is called, you get `ERR_BUSY`. 
