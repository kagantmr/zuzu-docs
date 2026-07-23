---
name: lcall
number: "0x15"
group: messaging
since: "1.0"
blocking: yes
headers: [zuzu/channel.h]
signature: "(port, len) -> {0, recv_len}"
args:
  - {reg: r0, name: port, desc: "Handle of the server port"}
  - {reg: r1, name: len, desc: "Request byte count in the lmsg buffer"}
returns: "On success, r0 = 0 and r1 = the reply length in the lmsg buffer."
errors:
  - {code: ERR_OVERFLOW, when: "Length of message exceeds the lmsg buffer size."}
  - {code: ERR_BADHANDLE, when: "No such port exists for the given handle."}
  - {code: ERR_BADTYPE, when: "The type of handle is not a port."}
  - {code: ERR_DEAD, when: "Recipient has died before the reply could be sent."}
  - {code: ERR_NOMEM, when: "Reply capability allocation failed, or the receiver's handle table is full."}
see_also: [lsend, lreply, call, waitany]
---

Long-message request/response: send from the `lmsg` buffer and block for a reply written back into it. A reply capability is minted into the receiver's table, and its slot index is what arrives in the receiver's `r0` (or `res->source` under `waitany`).

The long message buffer is inside the TLS ( on ARMv7: `TPIDRURO` -> `tdata_t` -> `lmsg_buf`) and is `LMSG_BUF_SIZE` bytes large.  That's how `lreply` gets addressed. You can use functions in `channel.h` to abstract the lmsg buffer operations.

## Pitfalls

The buffer is one buffer, so the reply lands on top of the request. The caller must save the data they had sent if they wish to keep it, and after the call is complete, the data must be copied out of the `lmsg` buffer.