---
name: SetLabel
number: "0x28"
group: handles
since: "1.1.1"
blocking: no
headers: [zuzu/cap.h]
signature: "(handle, marker) -> stamped_handle or -err"
args:
  - {reg: r0, name: handle, desc: "Process to label"}
  - {reg: r1, name: label, desc: "The value to label the process with. Must be nonzero; 0 (`LABEL_NONE`) is the reserved sentinel"}
returns: "ZUZU_OK on success"
errors:
  - {code: ERR_BADARG, when: "label is `LABEL_NONE` (0)"}
  - {code: ERR_BADHANDLE, when: "handle names no live entry"}
  - {code: ERR_BADTYPE, when: "handle is not a port"}
  - {code: ERR_BUSY, when: "Process is not FROZEN"}
  - {code: ERR_DUPLICATE, when: "process already has label"}
  - {code: ERR_NOMEM, when: "Caller's handle table is full"}
see_also: [PortCreate, Stamp, Grant, Destroy]
prowl:
  - {title: "Objects and handles", url: "/zuzu-docs/2.x/concepts/objects-handles/"}
  - {title: "HandleDuplicate", url: "/zuzu-docs/2.x/reference/syscalls/handleduplicate/"}
prowl_note: "Labels were replaced by markers set when duplicating a port handle."
---

Add a 32-bit label value to a process. Used for distinguishing at name server level.

## Pitfalls

Only the init process may call this. Only an *unlabeled* process can get labelled.
