---
layout: page
title: Locking
section: Kernel
prowl:
  - {title: "Kernel internals", url: "/zuzu-docs/2.x/internals/kernel/"}
---

The kernel runs on a **single core**, so it does not need the locking scheme of a multiprocessor kernel. Mutual exclusion inside the kernel comes from two things: interrupts are masked while kernel code touches shared state, and kernel code is **not preemptible**. A syscall or exception runs to completion before another thread runs, unless it blocks and calls the scheduler itself.

## Spinlock

The only lock the kernel has is a spinlock, currently used in the physical memory manager and the L2 page pool.

## What this means for kernel code

- A syscall handler may assume exclusive access to kernel data for as long as it does not block or call `Schedule()`.
- Interrupt handlers only touch state designed for it, such as signaling a notification, and run with IRQs disabled.
- Long operations are a latency problem, not a correctness one: the longer a syscall runs, the longer interrupts wait.

## Userspace

Userspace locking is separate. See [Sync primitives]({{ '/sdk/sync/' | relative_url }}).

## Plan

zuzu v3.0 Knead will likely use this spinlock as a GlobalLap: a single global lock that serializes kernel entry on multiple cores. That is a direction, not a promise.
