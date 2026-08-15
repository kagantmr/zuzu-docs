---
layout: page
title: Locking
section: Kernel
---

The only locking zuzu internally uses is a spinlock:

## Spinlocks (kernel)

The kernel has an internal spinlock that is currently only used in the PMM subsystem and the L2 page pool.

zuzu v3.0 Knead will likely utilize this as its GlobalLap (a global spinlock that serializes kernel access).
