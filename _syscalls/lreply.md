---
name: lreply
number: "0x16"
group: messaging
signature: "(reply_handle, len) -> 0 or -err"
args:
  - {reg: r0, name: reply_handle, desc: "Handle identifying the blocked caller"}
  - {reg: r1, name: len, desc: "Reply byte count in the lmsg buffer"}
returns: "0 on success."
errors:
  - {code: ERR_OVERFLOW, when: "Length of message exceeds the lmsg buffer size."}
  - {code: ERR_BADHANDLE, when: "No such port exists for the given handle."}
  - {code: ERR_DEAD, when: "Recipient has died before the reply could be sent."}
---

Reply to a large-message caller. Unlike `reply`, it takes an explicit reply handle, allowing a server to answer out of order.
