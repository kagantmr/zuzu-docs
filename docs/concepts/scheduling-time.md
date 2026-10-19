# Scheduling and time

!!! abstract "To write"
    Priorities, timeslices and the clock.

## Priorities

- base vs. max priority, TaskSetPriority / TaskSetMaxPriority, waiters re-sorted on change

## Timeslices

- microseconds, TIMESLICE_MIN/MAX, TaskSetTimeslice

## Tickless time

- no periodic tick; one-shot deadlines
- reading the counter from userspace, `<zuzu/uptime.h>`, counter_freq / counter_boot
