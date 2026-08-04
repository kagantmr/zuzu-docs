---
name: MsgLreply
number: "0x16"
group: messaging
since: "1.0"
blocking: no
headers: [zuzu/channel.h]
signature: "(reply_handle, len) -> 0 or -err"
args:
  - {reg: r0, name: reply_handle, desc: "Handle identifying the blocked caller"}
  - {reg: r1, name: len, desc: "Reply byte count in the lmsg buffer"}
returns: "0 on success."
errors:
  - {code: ERR_OVERFLOW, when: "Length of message exceeds the lmsg buffer size."}
  - {code: ERR_BADHANDLE, when: "No capability exists for the given handle."}
  - {code: ERR_BADTYPE, when: "This capability is not a reply capability."}
  - {code: ERR_DEAD, when: "Recipient has died or timed out before the reply could be sent."}
see_also: [MsgLsend, MsgLcall, MsgReply, Waitany]
---

Reply to a long-message caller using the minted reply capability. 

The long message buffer is inside the TLS ( on ARMv7: `TPIDRURO` -> `ThreadData` -> `buf`) and is `LMSG_BUF_SIZE` bytes large. Use `ChannelReply` in `channel.h` to abstract the buffer operations instead of touching it directly. The caller's `r2`-`r3` are zeroed.

## Pitfalls

The reply capability will be consumed unconditionally.