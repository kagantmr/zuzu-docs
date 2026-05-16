---
layout: doc
title: Memory
section: Kernel
order: 2
---

# Memory

*This page is being written.*

## Physical memory manager (PMM)

Bitmap allocator. `pmm_alloc()` / `pmm_free()`.

## Virtual memory manager (VMM)

`vmm_map_kernel()`, `vmm_map_user()`, L1 section mapping + L2 4KB pages.

## Address spaces

`addrspace_t` — per-process L1 table (16KB aligned), ASID, metadata. Created by `as_create()`, torn down by `as_destroy()`.

## Shared memory

`SYS_MEMSHARE` creates a shared region. `SYS_ATTACH` maps it into another process's address space. The physical pages are reference-counted.

## Kernel heap

`kmalloc` / `kfree` — slab-style allocator for small objects, fallback to page allocator for large ones.
