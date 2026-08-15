---
layout: page
title: Versioning
section: Project
---

zuzu (the kernel) and zuzuOS (the userspace) are versioned separately. They ship from one repository but move at different speeds and make different promises, so a single version number would be misleading.

## Version numbers

Both use semantic versioning: `MAJOR.MINOR.PATCH`.

| | Kernel | OS |
| --- | --- | --- |
| Tag format | `zuzu-vX.Y.Z-<codename>` | `zuzuos-vX.Y.Z-<codename>` |
| Current | 1.1.0 Loaf | 0.8 |

## Codenames

Codenames are **major-scoped** so one name covers an entire major version, not
a release.

| zuzu Major | Codename |
| --- | --- |
| 1.x | Loaf |
| 2.x | Prowl |
| 3.x | Knead |
| 4.x | Pounce |

| zuzuOS Major | Codename |
| --- | --- |
| 1.x | Sherbet |
| 2.x | Honey Milk |

So `zuzu-v1.0.0-loaf` and `zuzu-v1.7.3-loaf` are both Loaf. A codename changes only when the major version does. Individual releases may have a **theme** but a theme is descriptive prose, not a codename, and never appears in a tag. 

zuzuOS releases have names of their own at milestones: **1.0 Sherbet** is the thesis-freeze release.

## ABI policy

The two components differ here, and the difference is deliberate.

### Kernel: additive-only within a major version

Once a major version ships, its syscall ABI is frozen. Within 1.x:

- Syscall numbers are never reused or renumbered.
- Existing syscalls never change the meaning of an argument.
- Struct fields are only appended, never reordered or removed.
- New capability is added through previously-unused argument registers or
  new syscall numbers, with the zero value preserving prior behaviour.

The test is **binary** compatibility, not source: an ELF built against 1.0
must run unmodified on 1.1 and produce identical behaviour. Recompiling is not
an acceptable answer.

This is enforced by design rather than by convention. Two examples from 1.1:

**Markers.** `MARKER_NONE = 0` is the default, so a binary built before
  markers existed leaves the field zero and behaves exactly as before.
**Grant flags.** `SysGrant` gained a flags word in a previously-unread
  argument register; `flags = 0` reproduces the old behaviour bit for bit.

Removing a syscall is a breaking change even if nothing in the tree calls it, because some binary somewhere might. Deprecated surface is annotated in the minor release that supersedes it and removed at the next major bump: for example, the `WaitanyResult` PID source field, deprecated in 1.1, goes at 2.0.

### zuzuOS: fluid until 1.0

Userspace protocols carry no compatibility promise before 1.0. They are rewritten outright when a better design appears, as the nametable was in 0.8 when 4-character packed names gave way to variable-length paths. From 1.0 onward, OS protocols follow the same additive discipline as the kernel, but not as strictly.

The asymmetry is intentional: the kernel ABI froze at 1.0 while the userspace
was still finding its shape, and pretending otherwise would have meant
carrying compatibility shims for protocols that had not earned them yet.

## Compatibility checking

`sysd` compares its own `ZUZUOS_MIN_KERNEL_MAJOR` against the kernel version
in the syspage at startup, and exits with `FATAL_KERNEL_OUTDATED` on a
mismatch rather than failing later in some harder-to-diagnose way.

Individual binaries are not yet versioned; the userspace is built and shipped
as a unit.
