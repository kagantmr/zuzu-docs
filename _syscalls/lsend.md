---
name: MsgLsend
number: "0x14"
group: messaging
since: "1.0"
blocking: yes
headers: [zuzu/channel.h]
signature: "(port, len) -> 0 or -err"
args:
  - {reg: r0, name: port, desc: "Handle of the destination port"}
  - {reg: r1, name: len, desc: "Byte count in the lmsg buffer, at most `LMSG_BUF_SIZE`"}
returns: "0 on success."
errors:
  - {code: ERR_OVERFLOW, when: "Length of message exceeds the lmsg buffer size."}
  - {code: ERR_BADHANDLE, when: "No capability exists for the given handle."}
  - {code: ERR_BADTYPE, when: "This capability is not a port."}
  - {code: ERR_DEAD, when: "Recipient has died before the message could be sent."}
see_also: [MsgLreply, MsgLcall, MsgSend, Waitany]
---

Send a long-message to a recipient process over a port.

The long message buffer is inside the TLS ( on ARMv7: `TPIDRURO` -> `ThreadData` -> `buf`) and is `LMSG_BUF_SIZE` bytes large. Use `ChannelSend` in `channel.h` to abstract the buffer operations instead of touching it directly.