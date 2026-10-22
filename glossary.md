---
layout: page
title: Glossary
section: Overview
prowl:
  - { title: "Concepts", url: "/zuzu-docs/2.x/concepts/" }
---

**ASID** — Address Space Identifier. A tag on TLB entries so switching address spaces does not flush the TLB.

**Capability** — Unforgeable permission to use an object. In zuzu this is a handle.

**Channel** — A library wrapper over long-message passing (`ChannelCall`) that hides the TLS buffer.

**devmgr** — The process that holds device capabilities and hands them out by compatible string.

**fsd** — The filesystem daemon.

**Handle** — An index into a process's handle table that names a kernel object and carries permissions. Holding a handle is the permission to use the object.

**initrd** — A CPIO archive loaded by the bootloader that holds the boot programs and the boot manifest.

**Kickstart** — The syscall that makes a frozen, freshly injected process schedulable.

**Label** — A kernel-attested 32-bit value on a process, set once by sysd (a hash of its service path). The nameserver uses it to decide who owns a name.

**lmsg** — Long message: up to 512 bytes copied through a per-thread buffer instead of registers.

**Marker** — A `uint32_t` badge on a port handle, minted by `Stamp`, that tells a server which client a message came through.

**msg** — A register message: three words passed directly in CPU registers.

**Name table** — The registry of services, run by the `nameserver` process. Slot 0 of every process points at it. Entries are paths such as `/svc/fsd`.

**netd** — The network stack.

**ntfn** — Notification: a 31-bit word that is signaled and waited on. Became _events_ in 2.x.

**Port** — The endpoint of message passing. Processes that share a port handle can exchange messages.

**Process** — An address space, a handle table and threads. 2.x splits this into spaces and tasks.

**shm** — Shared memory object.

**nameserver** — The process that holds the service registry.

**sysd** — The init process (PID 1): spawns the boot programs, sets labels, loads programs, reaps dead processes.

**syspage** — A read-only page the kernel maps into every process with system information (version, memory, devices).

**Thread** — A unit of scheduling inside a process.

**Waitany** — Wait on many handles (ports and notifications) at once and learn which fired.

**ZCRT** — The zuzu C Runtime: crt0, libc subset, syscall veneers and protocol headers.

**ZXF** — The zuzu executable format.
