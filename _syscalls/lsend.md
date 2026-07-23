---
name: lsend
number: "0x14"
group: messaging
signature: "(port, len) -> 0 or -err"
args:
  - {reg: r0, name: port, desc: "Handle of the destination port"}
  - {reg: r1, name: len, desc: "Byte count in the lmsg buffer, at most 512"}
returns: "0 on success."
errors:
  - {code: ERR_OVERFLOW, when: "len exceeds 512 bytes"}
  - {code: "ERR_BADHANDLE / ERR_BADTYPE", when: "Bad or non-port handle"}
---

Send a large message. The bytes live in the caller's `lmsg` buffer; only the length is passed. Blocks like `send`.
