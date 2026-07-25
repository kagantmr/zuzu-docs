---
name: waitany
number: "0x17"
group: messaging
since: "1.0"
blocking: conditional
headers: [zuzu/msg.h]
signature: "(handles*, count, timeout_ms, result*) -> 0 or -err"
args:
  - {reg: r0, name: handles, desc: "Array of handles (ports and/or notifications) to wait on"}
  - {reg: r1, name: count, desc: "Number of handles in the array"}
  - {reg: r2, name: timeout_ms, desc: "`TIMEOUT_POLL` to poll, `TIMEOUT_INFINITE` to block, otherwise a deadline in ms"}
  - {reg: r3, name: result, desc: "Pointer to a `waitany_result_t` the kernel fills"}
returns: "0 on success; the fired source is described in `*result`."
errors:
  - {code: ERR_BADARG, when: "count is 0 or exceeds WAITANY_MAX_HANDLES, or result->size is smaller than the kernel's struct"}
  - {code: ERR_BADPTR, when: "handles or result pointer is invalid or unwritable"}
  - {code: ERR_DEAD, when: "A waited endpoint or notification was destroyed while blocked"}
  - {code: ERR_TIMEOUT, when: "TIMEOUT_POLL and nothing was ready"}
see_also: [recv, ntfn_wait, call, lcall]
---

Wait on several sources at once. It is the multiplexing primitive behind every event-loop
server. Blocks until any handle in the set has a message or signal ready, then fills
`result` describing which one fired and what it carried.

Unlike `recv` (one port) or `ntfn_wait` (one notification), `waitany` lets one thread serve
many clients and react to notifications from a single blocking point, which is why a
server needs only one thread, not one per client.

The result is delivered through a caller-provided struct rather than registers, because it
must say *which* handle fired and *what kind* of event it was. The wrapper sets `size` for
version negotiation; the kernel fills the rest:

| Field | Meaning |
| --- | --- |
| `size` | Set by the wrapper to `sizeof(waitany_result_t)`. |
| `matched_index` | Index into your `handles` array of the source that fired; `WAITANY_NO_MATCH` on timeout. |
| `kind` | Which kind of event fired: **see below.** |
| `source`, `r1`, `r2`, `r3` | Payload, **reinterpreted per `kind`**. |

The four payload slots mean different things depending on `kind`:

| `kind` | `source` | `r1` | `r2`, `r3` |
| --- | --- | --- | --- |
| `WAITANY_KIND_SEND` | sender PID | payload / lmsg length | payload words |
| `WAITANY_KIND_CALL` | reply handle | sender PID | payload / lmsg length |
| `WAITANY_KIND_NTFN` | 0 | notification bits | — |
| `WAITANY_KIND_TIMEOUT` | — | — | — |

So a server's dispatch loop switches on `result.kind`: a `CALL` gives you a reply handle in
`source` to answer with `reply`/`lreply`; a `SEND` is fire-and-forget with the sender in
`source`; an `NTFN` carries its signalled bits in `r1`; a `TIMEOUT` means the deadline
expired with `matched_index` set to `WAITANY_NO_MATCH`.

Two subtleties in the timeout behaviour:

- A **poll** (`TIMEOUT_POLL`) that finds nothing returns `ERR_TIMEOUT`.
- A **finite deadline** that expires returns `0` with `kind == WAITANY_KIND_TIMEOUT` which is a
  success whose `matched_index` is `WAITANY_NO_MATCH`.

A correct loop therefore checks both: a negative return for the poll case, and
`kind == WAITANY_KIND_TIMEOUT` on a zero return for the deadline case.

At most `WAITANY_MAX_HANDLES` handles can be waited on in one call; a larger `count` is
rejected with `ERR_BADARG`.

## Pitfalls

`kind` must be checked before reading any payload slot, because the slots are reinterpreted
, reading `source` as a sender PID when the kind is `CALL` gives you a reply
handle instead, and vice versa. This is the single most common `waitany` bug.