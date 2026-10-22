---
layout: page
title: Debugging
section: Platform
prowl:
  - {title: "Kernel internals", url: "/zuzu-docs/2.x/internals/kernel/"}
---

## Kernel log

The kernel logs to its own serial port using `kprintf`. Log lines are tagged with a subsystem, for example `(sched)` or `(loader)`, and have levels (`KINFO`, `KDEBUG`, ...). The level is a build-time configuration option.

## Panics

A kernel panic prints the message, and for a fault shows a **FAULT section** with the exception class, the faulting address, and the full register state of the faulting context (including VFP registers). Return addresses are resolved through the kernel symbol table (`ksym`) and shown as function names, so a backtrace is readable without a debugger.

A fault in **user mode** does not panic the kernel. The offending process is killed and its exit status is `KILLED_TAG | reason`; the parent can read it with `Wait`.

## Debugging under QEMU

```
gmake BOARD=vexpress-a15 run        # boot in QEMU
gmake BOARD=vexpress-a15 debug      # start stopped, gdb server on tcp::1234
gmake BOARD=vexpress-a15 smoke      # boot headless and check it came up
```

Connect with `arm-none-eabi-gdb build/arm-vexpress-a15/zuzu.elf` and `target remote :1234`. `gmake dump` writes a disassembly next to the build output.

## Userspace

Processes can print through the UART driver, and `zuzu/log.h` has leveled logging macros that prefix the service name. The shell's test programs include `zztest` (kernel and IPC tests) and `zuzufetch` (system information from the syspage).

## Benchmarks

Turn on `CONFIG_ZUZU_BENCH` and the kernel counts cycles in the hot paths (message call, memory map, IRQ delivery). Counters are printed on request, which is how the numbers in the project's benchmark notes were produced.

## Sanitizers

The kernel can be built with UBSan: undefined behavior reports its location through the same log and panic path.

## Common symptoms

| Symptom | Likely cause |
|---|---|
| silent hang after the boot banner | sysd waiting 30 s for `/svc/devmgr` or `/svc/fsd` |
| `ERR_NOENT` from `LookupService` | the server is not in `boot.manifest`, or it did not register |
| `ERR_NOPERM` from `RegisterService` | the process has no label, because it was not started by the manifest |
| `ERR_BADHANDLE` right after a lookup | the handle was closed or the slot reused; look up again |
| process dies immediately | a fault in user mode; check the exit status with `Wait` |
