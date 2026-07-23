---
name: lcall
number: "0x15"
group: messaging
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
---

Large-message request/response: send from the `lmsg` buffer and block for a reply written back into it.
