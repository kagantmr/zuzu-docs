---
layout: doc
title: Processes & threads
section: Kernel
order: 3
---

# Processes & threads

*This page is being written.*

## process_t

Holds: PID, parent PID, address space pointer, handle table, thread list, child list, TCB page, name.

## thread_t

Holds: TID, state (READY/RUNNING/BLOCKED/ZOMBIE/FROZEN), kernel stack, trap frame pointer, kernel SP (at offset 12 for `switch.S`), priority, time slice, IPC state, wake tick.

## Scheduling

8-priority-level round-robin. `sched_add()` enqueues; `schedule()` picks the highest-priority non-empty queue. Preemption fires from the generic timer IRQ.

## Threads within a process

`SYS_TASK_TMAKE` creates a thread inside the calling process's address space. `SYS_TASK_TJOIN` blocks until a thread exits. `SYS_TASK_TQUIT` terminates the calling thread.

## Thread-local storage

`thread_info_va` is written to `TPIDRUR` (cp15 c13) on every context switch, making it readable from userspace via `mrc p15, 0, r0, c13, c0, 3`.

## Zombie reaping

Zombie reaping happens in the idle loop (boot stack), never inside the scheduler while still on the victim's kernel stack. Doing so would unmap the stack mid-execution, causing a nested data abort.
