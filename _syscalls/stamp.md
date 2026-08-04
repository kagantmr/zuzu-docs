---
name: Stamp
number: "0x27"
group: handles
since: "1.1"
blocking: no
headers: [zuzu/msg.h]
signature: "(handle, marker) -> stamped_handle or -err"
args:
  - {reg: r0, name: handle, desc: "Port handle to stamp. Must be unmarked (marker == MARKER_NONE)"}
  - {reg: r1, name: marker, desc: "The badge to stamp with. Must be nonzero; 0 (`MARKER_NONE`) is the reserved unmarked sentinel"}
returns: "The new, marked handle in the caller's own table."
errors:
  - {code: ERR_BADARG, when: "marker is `MARKER_NONE` (0)"}
  - {code: ERR_BADHANDLE, when: "handle names no live entry"}
  - {code: ERR_BADTYPE, when: "handle is not a port"}
  - {code: ERR_DEAD, when: "The port has died"}
  - {code: ERR_DUPLICATE, when: "handle is already marked; a marked handle cannot itself be re-stamped"}
  - {code: ERR_NOMEM, when: "Caller's handle table is full"}
see_also: [PortCreate, Waitany, Grant, Destroy]
---

Badge a port. `Stamp` mints a new handle in the caller's own table that points at the same
underlying port as `handle`, but carries `marker` which is an opaque, caller-chosen value the kernel
attaches to that handle entry and no other. `handle` itself is left untouched: `Stamp` is
non-consuming, so the same unmarked handle can be stamped again with a different marker to
mint additional badges for the same port.

The marker travels with whichever badged handle a sender used to `MsgSend` or `MsgCall`. On the
receiving end, `Waitany` reports it back in `WaitanyResult.marker`, so one port and one
`Waitany` loop can tell multiple logical clients apart without a handle (or a thread) per
client. See [waitany]({{ '/abi/syscall/waitany/' | relative_url }}) and
[Markers & nametable]({{ '/kernel/markers-nametable/' | relative_url }}).

## Pitfalls

Only an *unmarked* handle (`marker == MARKER_NONE`) can be stamped; stamping an
already-marked handle returns `ERR_DUPLICATE` rather than re-badging it or minting a second
badge on top of the first. To hand out several badges for one port, `Stamp` the same
unmarked source handle multiple times, not the badges it produced.

`Stamp` only accepts port handles so notifications, shared memory, devices, replies, and
tasks all fail with `ERR_BADTYPE`.
