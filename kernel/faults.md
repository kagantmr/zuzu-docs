---
layout: page
title: Faults/exceptions
section: Kernel
---

An **exception** is when a section of code causes the CPU hardware to transfer control to a handler function because of a synchronous or asynchronous condition. Exceptions can occur in kernel and user code alike, however the way they are handled are very distinct. Zuzu adopts a strict approach to exception handling.

## ARM exception types

The ARMv7 architecture has multiple types of exceptions, but zuzu is concerned about only 7 of them:

1. **Reset**: CPU warm reset (currently not used under zuzu)
2. **Undefined Instruction:** Opcode is invalid, not allowed or the functional unit for it is disabled.
3. **Supervisor Call:** Used to route system calls.
4. **Prefetch Abort:** Program counter/instruction pointer `pc` is pointing to an invalid memory location, or is misaligned, etc.
5. **Data Abort:** A load/store instruction is pointing to invalid/unmapped memory, read-only not respected, byte misalignment, etc.
6. **IRQ:** Normal interrupt request
7. **FIQ:** Fast interrupt request.

## Kernel exception handling

As of zuzu kernel v1.0.1, zuzu panics unconditionally on most exceptions coming from kernel code. **Prefetch abort**, **data abort**  and **undefined instruction** exceptions are simply not worthy of a recovery attempt as they point out a catastrophic error within the code.  **Supervisor Call** and **IRQ** exceptions are routed through dispatch functions. **FIQ** and **reset** vectors are unused. 

The kernel will report Data/Instruction Fault Status and Address Registers (IFSR/IFAR/DFSR/DFAR) on one of the aborts in the panic log. To prevent panic code from being stuck, `panic()` cannot be exited once entered. 

## User exception handling

User exceptions are handled differently compared to the kernel as some user exceptions may be used to lazy-enable or lazy-grant things like memory or functional units, but the majority of them end up in process termination. The process' data is torn down, and all IPC peers are woken with `ERR_DEAD`.

### Page faults

A page fault happens when a process accesses a region of memory that is not mapped in its address space. If a page that was previously asked for via `MemMap` (who records the page but does not map it), it is a demand-zero region like `.bss` or an unfaulted stack page; when touched, the page traps to the kernel exception handler, which maps the page and clears it for security. All other page faults will cause in process termination.

### Lazy VFP

Processes do not get the VFP enabled on startup. Instead, when a VFP instruction executes, it's trapped into the kernel, who enables the VFP and restarts the offending instruction. This saves 40% on context switch time because there is no need to save ~300 bytes of large register state during a context switch (it's done in the exception handler)

### Resurrection 

Because each service runs isolated in its own address space with no kernel privilege, a fatal user fault is contained: the process dies, but the kernel and every other service keep running. The same fault in a monolithic kernel (a driver touching bad memory) would be a kernel fault that crashes the whole system. Automatic resurrection (a supervisor observing the death and restarting the service) is planned for zuzuOS v0.8 and not yet implemented.
