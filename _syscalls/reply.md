---
name: MsgReply
number: "0x13"
group: messaging
since: "1.0"
blocking: no
signature: "(reply_handle, w1, w2, w3) -> 0 or -err"
args:
  - {reg: r0, name: reply_handle, desc: "Reply handle identifying the blocked caller (from the `MsgRecv` that woke on a `MsgCall`)"}
  - {reg: "r1–r3", name: "w1–w3", desc: "The three reply words"}
returns: "0 on success."
errors:
  - {code: ERR_BADHANDLE, when: "No such handle"}
  - {code: ERR_BADTYPE, when: "Handle is not a reply capability"}
  - {code: ERR_DEAD, when: "The caller has died or timed out"}
see_also: [MsgCall, MsgRecv, MsgLreply, Waitany]
---

Answer a client blocked in `MsgCall`, using the reply handle delivered by `MsgRecv`. The three
words land in the caller's `r1`–`r3`.

The reply capability is consumed: it is single-use, and after `MsgReply` the handle is gone. Subsequent uses of the handle will return `ERR_BADHANDLE`.