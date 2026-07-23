---
name: lsend
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
see_also: [lreply, lcall, send, waitany]
---

Send a long-message to a recipient process over an endpoint.

The long message buffer is inside the TLS ( on ARMv7: `TPIDRURO` -> `tdata_t` -> `lmsg_buf`) and is `LMSG_BUF_SIZE` bytes large. You can use functions in `channel.h` to abstract the `lmsg` buffer operations.