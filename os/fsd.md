---
layout: page
title: fsd
section: zuzuOS
prowl:
  - {title: "fsd", url: "/zuzu-docs/2.x/os/fsd/"}
---

`fsd` is the filesystem daemon. It replaced the older `fat32d` and `fbox` pair in zuzuOS 0.7 and serves files from the SD card to everything else.

## Structure

fsd talks to storage through a block driver (`pl181drv` or `emmc2drv`, protocol `SD_CMD_*`) and exposes files through its own protocol. The filesystem itself is a **backend** behind an interface; the one backend today is FAT (using the FatFs library). Adding another filesystem means adding another backend.

## Sessions

A client first creates a **shared memory buffer** (at least 4 KiB, at most 4 MiB; 64 KiB is the suggested default) and sends it to fsd with `FSD_SET_BUF`. fsd maps it. From then on every request is a small message plus a request struct in the buffer, and any data goes through the buffer as well. The client pays for the memory, not fsd.

fsd keeps a table of clients keyed by PID (32 clients) and a table of open files (64 files, 16 per client), so a file descriptor only works for the client that opened it.

## Commands

| Command | Does |
|---|---|
| `FSD_SET_BUF` | grants the shared buffer |
| `FSD_OPEN` / `FSD_CLOSE` | open a path to an fd, close an fd |
| `FSD_READ` / `FSD_WRITE` | transfer `count` bytes of data through the buffer |
| `FSD_SEEK` | move the file position (`SET`, `CUR`, `END`) |
| `FSD_STAT` / `FSD_FSTAT` | file size and type |
| `FSD_READDIR` | list a directory |
| `FSD_UNLINK` / `FSD_RENAME` | remove or rename |

Open modes are read, write, create-new, create-always, open-always and append.

## Safety

fsd copies the request out of the shared buffer before acting on it, so a client cannot change it between the check and the use. It rejects offsets and lengths that fall outside the buffer. Requests are checked against their `cmd` field.

## Client library

`<zuzu/fsd_client.h>` wraps this: `FsdConnect`, `FsdOpen`, `FsdRead`, `FsdWrite`, `FsdGetStat`, `FsdReadDir` and friends. The POSIX shim in the newlib tier speaks the same protocol, so `open`/`read`/`write` from a C program end up here.

## Limits

fsd is a single thread and not zero-copy: data is copied once into the client buffer. A redesign is planned in a later zuzuOS.
