---
layout: page
title: ZCRT
section: SDK
---

The zuzu C Runtime (ZCRT) is the application SDK for zuzuOS.

## What ZCRT provides

ZCRT is the standard environment for zuzuOS applications and services. It layers into:

- Startup runtime (crt0): Running crt0 before main which sets up the stack, runs constructors saves argc and the argv pointer pushed onto the stack by the kernel, passing argc and argv to entry point, handling main's exit, run destructors, call PQuit(main_return_code).

- A freestanding C library. stdio, stdlib, string, math, malloc, and friends. The familiar C surface, minus full POSIX. zuzu deliberately avoids implementing things like signals and fds, which are POSIX constructs.

- Syscall veneers (zuzu/). C wrappers over the frozen syscall ABI to use msg, lmsg, ntfn, irq, channel, memprot, task, and the raw syscall_nums.

- Service protocols (zuzu/protocols/): fsd (filesystem), netd (network), nic, socket, uart, exec, nametable, and more. A program includes the protocol header for whatever service it needs.

- Utility data structures: list, ring, channel, vector, arena, spinlock...
