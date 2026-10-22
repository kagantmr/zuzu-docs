---
layout: page
title: IPC protocols
section: zuzuOS
prowl:
  - {title: "Library reference", url: "/zuzu-docs/2.x/reference/lib/"}
---

zuzuOS servers speak small, fixed protocols over `MsgCall`. The convention is the same everywhere: the first payload word selects the command, the reply's first word is a status (`ZUZU_OK` or a negative error), and larger data travels in shared memory or the long-message buffer. Protocol headers live in `include/zuzu/protocols/`.

## Message shape

A `MsgCall` carries three words. The kernel overwrites the last word with the sender's PID on the way in, so in practice a request has **two** payload words of its own: the command and one argument. A client that needs more packs arguments into that word, uses the long-message buffer, or uses shared memory. For example `FSD_SET_BUF` packs the handle slot into the low 12 bits of the buffer size, which are zero for any page-aligned size.

On the server side a receive yields the reply handle, the sender's PID, the command and the argument. The server answers with `MsgReply` on that handle. A server that listens on several things at once uses `Waitany`, which also returns the marker and the sender's **label**.

```c
Message m = ZuzuMsgCall(port, CMD, arg, 0);
if ((int32_t)m.w1 < 0) { /* error */ }
```

## Protocols

| Header | Between | Commands |
|---|---|---|
| `nametable.h` | everyone and the nameserver | `NT_REGISTER`, `NT_LOOKUP`, `NT_LOOKUP_PID`, `NT_SCRUB_PID` |
| `exec.h` | shell and sysd | `SYSD_EXEC` (load a program by path) |
| `devm.h` | drivers and devmgr | `DEVM_REQUEST` (by compatible string) |
| `uart.h` | console users and the UART driver | `UART_CMD_WRITE`, `UART_CMD_READ` (long messages) |
| `mmcdrv.h` | fsd and the SD driver | `SD_CMD_GET_BUF`, `SD_CMD_READ`, `SD_CMD_WRITE` |
| `fsd.h` | clients and fsd | `FSD_SET_BUF`, `OPEN`, `READ`, `WRITE`, ... |
| `nic.h` | netd and the NIC driver | `NIC_CMD_SEND`, `GETMAC`, `GETBUF`, `STATS`, `RECV` |
| `netd.h` | tools and netd | `NETD_SEND`, `NETD_GET_IP` (defined, not served in 0.7) |
| `socket.h` | applications and netd | `SOCKETD_*` (defined, not served in 0.7) |

## Errors

Replies use the error codes from `<zuzu/err.h>` ([error codes]({{ '/abi/error-codes/' | relative_url }})). Protocols do not invent new numbers, except `SD_ERR_IO`, which maps onto `ERR_IO`.

## Writing a new protocol

Follow the pattern: a header with command numbers and a comment for each describing request and response, and shared memory for anything larger than a word. See [Writing a service]({{ '/sdk/writing-a-service/' | relative_url }}).
