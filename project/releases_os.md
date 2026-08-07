---
layout: page
title: zuzuOS releases
section: Project
---

Feature list of zuzu kernel releases. The kernel majors are codenamed after **cold, sweet, non-alcoholic (usually) drinks**.

### zuzuOS v0.5-beta

The version that came with v0.5.0. Click [here](https://github.com/kagantmr/zuzu/releases#release-zuzuos-v0.5.0) for the repository.

### zuzuOS v0.6-beta

- POSIX shim & newlib libgloss stubs, file-descriptor table on top of handle table.
- klib split from lib. 

*Note: This version has no distinct release on GitHub, bundled with v0.7*

### zuzuOS v0.7-beta

- `fat32d` and `fbox` replaced with a single filesystem daemon (`fsd`).
- Complete libgloss POSIX shim

Click [here](https://github.com/kagantmr/zuzu/releases#release-zuzuos-v0.7.0) for the repository.

### zuzuOS v0.8-beta

Planned:

- Supervision by `sysd`
- Resurrection thread running on `sysd`.
- Using shm to store data to give back after resurrection
- Remove dens for a cleaner nametable

### zuzuOS v0.9-beta

- Use POSIX shim to bring in binutils, sbase, etc.
- Fully working TCC

### zuzuOS v1.0 Sherbet

- Framebuffer console, multiple ttys managed
- Watchdog(?)
- Complete documentation website along with SDK.
- TCP complete
- .zxf support
- Time daemon (update time from network)

### zuzuOS v2.0 Honey Milk

- Window compositor
- Distributed network layer
- Shared libraries
- mlibc: pthreads, signal compat layer
- GCC self-hosting (?)
