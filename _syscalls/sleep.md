---
name: sleep
number: "0x05"
group: task
since: "1.0"
blocking: yes
signature: "(ms) -> 0"
args:
  - {reg: r0, name: ms, desc: "Duration in milliseconds"}
returns: "0."
see_also: [yield, tjoin, wait]
---

Block the calling thread for a fixed duration. Other threads in the process continue to run.

Durations are measured in scheduler ticks, so the real sleep is rounded up to whole ticks;
a sub-tick duration sleeps one tick rather than returning immediately. There is no infinite
form (use a blocking `recv`/`wait` for that) and no polling form.