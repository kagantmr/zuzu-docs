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
  - {reg: r3, name: result, desc: "Pointer to a waitany_result_t the kernel fills"}
returns: "0 on success; the fired source is described in *result."
errors:
  # from sys_waitany — need the code to fill these
see_also: [recv, ntfn_wait, call, lcall]
---

Wait on several sources at once. The multiplexing primitive behind every event-loop
server. Blocks until any handle in the set has a message or signal ready, then fills
`result` describing which one fired and what it carried.

Unlike `recv` (one port) or `ntfn_wait` (one notification), `waitany` lets a single thread
serve many clients and react to notifications from one blocking point, which is why a
server needs only one thread, not one per client.