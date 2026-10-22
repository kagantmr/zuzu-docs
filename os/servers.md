---
layout: page
title: Server processes
section: zuzuOS
prowl:
  - {title: "zuzuOS", url: "/zuzu-docs/2.x/os/"}
---

zuzuOS 0.7 (the userspace that ships with Loaf) is a set of ordinary processes. The kernel starts two of them, `sysd` and `devmgr`; everything else is started by `sysd`.

| Process | Name in the nametable | Role | Started by |
|---|---|---|---|
| [`sysd`]({{ '/os/sysd/' | relative_url }}) | `/svc/sysd` | init, program loader, reaper | kernel |
| [`devmgr`]({{ '/os/devmgr/' | relative_url }}) | `/svc/devmgr` | holds every device capability and hands them out | kernel loads it, sysd starts it |
| [`nameserver`]({{ '/os/nametable/' | relative_url }}) | slot 0 of everyone | the service registry | sysd |
| `pl011drv` | `/dev/uart0` | UART driver, the console | sysd |
| `pl181drv` / `emmc2drv` | `/dev/mmc0` | SD card driver (vexpress / Raspberry Pi 4) | sysd |
| [`fsd`]({{ '/os/fsd/' | relative_url }}) | `/svc/fsd` | filesystem server | sysd |
| `lan9118drv` | `/dev/eth0` | network card driver (vexpress) | sysd |
| [`netd`]({{ '/os/netd/' | relative_url }}) | `/svc/netd` | network stack | sysd |
| `zzsh` | `/env/zzsh` | interactive shell | sysd, last |

## Names

Drivers live under `/dev`, services under `/svc`, and the shell and other user-facing programs under `/env`. A name is a path of at most 63 characters.

## How they talk

Every server owns a **port** and registers it under its path with the [nameserver]({{ '/os/nametable/' | relative_url }}). A client looks the path up, receives a handle to the port, and sends it messages. See [IPC protocols]({{ '/os/protocols/' | relative_url }}) for the shapes of those messages.

Bulk data does not go through messages. Servers that move data (fsd, the SD and NIC drivers) use **shared memory** that the client or driver creates and grants, and use messages or notifications only to say that data is ready.

## Identity

Every server carries a **label**, a 32-bit number set by `sysd` before the server starts. The label is a hash of the server's service path (for example the hash of `/svc/fsd`), and the kernel reports it on every message the server sends. The nameserver uses it to decide who may own a name: only the process with the label for a path can register that path. A process without a label cannot register at all.

## Trust

Servers are not privileged, with a few exceptions: `sysd` is the only process that may inject code into another address space and set labels, and `devmgr` is the only process that holds device capabilities. A driver gets the device it needs by asking devmgr, and gets nothing else.

## Failure

A server that crashes takes only itself down. sysd reaps dead processes and tells the nameserver to scrub their names, so clients get `ERR_DEAD` or a failed lookup rather than a stale port. Restarting servers automatically is not part of 0.7; it is planned for a later zuzuOS.

## Boot

Which servers start, and with which paths, is decided by `boot.manifest` in the initrd. See [Boot sequence]({{ '/platform/boot/' | relative_url }}).
