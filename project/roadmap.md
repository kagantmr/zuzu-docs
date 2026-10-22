---
layout: page
title: Roadmap
section: Project
prowl:
  - {title: "Roadmap", url: "/zuzu-docs/2.x/project/roadmap/"}
---

This is the roadmap as it stood for the 1.x (Loaf) series. For what is planned now, see the [current roadmap](/zuzu-docs/2.x/project/roadmap/).

## Kernel

| Version | Codename | Focus |
|---|---|---|
| 1.0 | Loaf | Handles, ports, messages, notifications, shared memory, priority scheduler, ELF/ZXF loader |
| 1.1 | Loaf | Markers, labels (1.1.1), lazy BSS, lazy VFP, direct-switch handoff, 256 threads per process, new build system |
| 1.2 | Loaf | `MemUnmapRange`, memory pressure and OOM handling |
| 2.0 | Prowl | New object model (spaces, tasks, ports, events, memory), `Hold`, task inspection, tickless timer, HAL cleanup |
| 3.0 | Knead | Multiple cores with a global kernel lock |
| 4.0 | Pounce | Unplanned |

## zuzuOS

| Version | Focus |
|---|---|
| 0.5 | Initial userspace: sysd, devmgr, UART and SD drivers, shell |
| 0.6 | POSIX shim and newlib stubs, file descriptors over handles |
| 0.7 | `fsd` replaces `fat32d` and `fbox`; complete libgloss shim |
| 0.8 | New name server architecture |
| 0.9 | Supervision and resurrection of services |

Dates are not promised; see the [release notes]({{ '/project/releases_kernel/' | relative_url }}).
