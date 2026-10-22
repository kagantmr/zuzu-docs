---
layout: page
title: Sync primitives
section: SDK
prowl:
  - {title: "Sync primitives", url: "/zuzu-docs/2.x/reference/sync/zone/"}
---

The only synchronization primitives in the libraries currently are:

## Userspace Spinlocks (zzuspin)

This simple spinlock implementation is used currently as zuzuOS does not have any synchronization primitives.

zuzu v2.0 Prowl will deliver tools to implement userspace synchronization primitives. In 1.x you can build blocking primitives on top of **notifications** (a waiter blocks in `NtfnWait`, and the releaser calls `NtfnSignal`) and keep shared state in **shared memory**; use the spinlock only for very short critical sections between threads of one process.
