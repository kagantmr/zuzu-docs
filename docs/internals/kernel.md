# Kernel design

!!! abstract "To write"
    The decisions that shape the kernel.

## Big kernel lock

- non-preemptive kernel, IRQ-off windows

## Boot path

- early boot, MMU, handing over to rootsvc

## Syscall dispatch

- SvcDispatch, the table, verbs
