---
layout: page
title: sysd
section: zuzuOS
prowl:
  - {title: "Boot (rootsvc)", url: "/zuzu-docs/2.x/os/boot/"}
---

`sysd` is the first process (PID 1). It starts everything else, sets identities, loads programs for other processes, and cleans up after processes that die. It is the only process allowed to put a program into another process's address space.

## Startup

1. **Version check.** sysd reads the kernel version from the syspage and exits with a fatal tag if the kernel is older than this userspace requires.
2. **Receive boot arguments.** The kernel passes the initrd address and size and devmgr's entry point and stack in sysd's `argv`.
3. **Set its own label** (`/svc/sysd`).
4. **Start the nameserver.** sysd finds `bin/nameserver` directly in the initrd, spawns it, labels it, and places the nameserver's port in its own slot 0. It must do this by hand because fsd and the normal spawn path do not exist yet.
5. **Register itself** under `/svc/sysd`.
6. **Start devmgr.** The kernel already loaded devmgr and handed it its device capabilities, frozen. sysd grants it the nameserver port, labels it (`/svc/devmgr`) and kickstarts it.
7. **Read `boot.manifest`** from the initrd (a CPIO archive) and parse it, one program per line.
8. **Spawn, label, inject.** For every program present in the initrd, sysd calls `PSpawn`, sets the label from the manifest's service path, and fills the address space with `AsInject`.
9. **Kickstart** every injected program.
10. **Wait for services.** sysd waits for `/svc/devmgr` and, if the manifest has it, `/svc/fsd`. Programs marked `late` (the shell) are spawned after that. Programs not in the initrd are loaded from the SD card through fsd and sysd.

After boot sysd sits in a loop: reap any dead child, tell the nameserver to scrub that process's names, and handle one message.

## Labels

Before kickstarting a process, sysd sets its label to a hash of its service path, or of its program path if the manifest gives none. Only sysd can set a label, and only once per process. That makes the label an identity the kernel vouches for: a server cannot claim another server's name, because it cannot get its label.

## Loading programs

Other processes cannot call `AsInject`, so they ask sysd (`SYSD_EXEC`). The request carries the path and arguments in the long-message buffer. sysd looks the path up through fsd, reads the whole file, injects it into the process the caller created, and replies with the entry point, stack and `argv` pointer. The caller then calls `Kickstart` on its own task handle. The shell uses this to run programs from the SD card.

## Manifest

The manifest has one entry per line: `program|role[:flags][|service-path]`.

| Role | Meaning |
|---|---|
| `init`, `dev` | the kernel starts these; sysd skips them |
| `tty` | a console driver; its path is registered like any service |
| `none` | start it and register nothing special |
| `file` | pack it into the initrd but never spawn it |
| `:late` flag | start after `/svc/fsd` is up |

The optional third field is the path the program will own in the nametable, and the label sysd gives it.

## Things to remember

sysd is a single thread serving everyone, so a server must not call sysd while sysd is waiting on that server. Boot waits for `devmgr` and `fsd` with a 30 second timeout, so a missing service looks like a long pause rather than a hang.
