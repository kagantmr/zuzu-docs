---
layout: page
title: Scheduling
section: Kernel
prowl:
  - {title: "Scheduling and time", url: "/zuzu-docs/2.x/concepts/scheduling-time/"}
---

zuzu schedules **threads** on a single core with a fixed-priority, round-robin scheduler. The scheduler lives in `kernel/sched/`.

## Priorities and run queues

There are eight priority levels (`0`–`7`). A thread starts at the default priority, level `1`. Each level has its own FIFO run queue, and a bitmask records which levels are non-empty, so picking the next thread is a find-highest-set-bit followed by a pop from that queue.

The highest-priority ready thread always runs. A thread only gives up the CPU when it blocks (IPC, `Sleep`, a wait), calls `Yield`, exits, or runs out of its timeslice **and** another thread of equal or higher priority is ready. If nothing else is ready at its level or above, a thread keeps running past the end of its slice without being interrupted.

When a thread becomes ready at a higher priority than the running one, the kernel sets a reschedule flag and the switch happens on the way back to user mode.

## Timeslices

Each thread has a timeslice measured in ticks. The tick rate is 100 Hz (`TICK_HZ`) and the default slice is 5 ticks, 50 ms. The kernel stores the slice as an absolute counter **deadline** (`slice_deadline`) when it dispatches the thread; it is compared against the generic timer rather than decremented by a periodic interrupt.

The timer is only armed when it has something to do: for the next sleeper to wake or for the running thread's slice deadline **when a peer could actually preempt it**. With nothing sleeping and no peer ready, the timer is disabled and the core sits in `wfi` until a device interrupt arrives.

## Sleeping and timeouts

Sleeping threads and timed waits sit in a 512-slot timer wheel, slots roughly 4 ms wide, indexed by wake deadline. A slot is checked when the wheel advances past it. Timed-out IPC and notification waits are unlinked from their wait queues and woken with `ERR_TIMEOUT`.

## Direct handoff

`MsgCall` and `MsgLcall` can switch straight to the receiving thread when it is already waiting and no other CPU taker is ready at or above its priority, skipping the run queue. This is what makes the request/response round trip cheap.

## Idle and cleanup

When no thread is ready the kernel runs an idle thread on its own small stack. It reaps dead processes and threads, then waits in `wfi`. Dead threads and processes are queued for destruction and freed from the idle thread (or the next reschedule), never on their own stack.

## FPU

VFP state is switched lazily. The FPU is disabled when a thread that does not own the registers is switched in, and the first use traps. The handler enables the FPU and hands it off, saving the previous owner's state.

## Not in Loaf

Timeslice donation across `MsgCall` and priority inheritance are planned, not implemented. Fixed priorities mean a low-priority server can delay a high-priority client; keep servers at the priority of their most urgent client.
