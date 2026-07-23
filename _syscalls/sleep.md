---
name: sleep
number: "0x05"
group: task
signature: "(ms) -> 0"
args:
  - {reg: r0, name: ms, desc: "Sleep time in milliseconds"}
returns: "0. There is no infinite sleep and no polling form."
---

Voluntarily block the process for a fixed duration.
