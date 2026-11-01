# Roadmap

What is planned for each release. For what has already shipped see
[zuzu releases](releases-zuzu.md) and [zuzuOS releases](releases-zuzuos.md).
Plans may change, so you can stay updated via the [issue tracker](https://github.com/kagantmr/zuzu/issues).

## zuzu kernel

### 2.x Prowl

Current. Minor releases add to the 2.0 interface without breaking it. AArch64 port in progress.

### 3.0 Knead

- SMP with a single global kernel lock (`KernelLap`)
- timeslice donation in `Call()`
- resource budgets per Space
- transferring Port ownership
- Core affinity
- Region object instead of Memory
- removing fixed memory limits

### 4.0 Pounce

- Power management
- Kernel message box

## zuzuOS

### 0.8

The headline is **parent-routed services**: a program finds services through
its parent, not through a global name service.

- every program reaches services through a parent port in slot 0; rootsvc
  answers announce and session requests with a route table and its own
  policy
- services open client sessions through a common `OP_SESSION_OPEN`; ttysvc,
  netd and fsd move to it
- services marked stateless are restarted in place when they fault, and
  clients waiting on them are answered when the service comes back
- logging service (`logsvc`)
- zzsh rewrite
- fsd redesign
- IP fragmentation and reassembly in netd
- SNTP and a time service
- Raw sockets

### 0.9

- Proper fault recovery, backing up data via shared memory

### 1.0

- User accounts, user account service.