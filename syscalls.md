---
layout: doc
title: Syscall ABI
section: Kernel
order: 6
---

# Syscall ABI

## Calling convention

| Field | Location | Notes |
|-------|----------|-------|
| Syscall number | `SVC #n` immediate (lower 8 bits) | ARM mode only |
| Arg 0 / return | `r0` | Modified by kernel |
| Arg 1 | `r1` | Preserved if unused |
| Arg 2 | `r2` | Preserved if unused |
| Arg 3 | `r3` | Preserved if unused |
| Clobbered | `r0` only | `r1–r12`, `sp`, `lr` preserved |

Error values are negative `r0`. Positive or zero means success.

The syscall number sits in the `SVC` instruction itself rather than a register. The kernel extracts it at `LR_svc - 4` (the instruction word before the return address), masking the lower 8 bits. This means zero register overhead at the call site — arguments are already in `r0–r3` per AAPCS.

---

## Syscall table

### Task lifecycle (`0x00–0x0F`)

| Number | Name | Signature |
|--------|------|-----------|
| `0x00` | `SYS_TASK_PQUIT` | `(status) → never returns` |
| `0x01` | `SYS_TASK_YIELD` | `() → 0` |
| `0x03` | `SYS_TASK_WAIT` | `(pid, &status, flags) → 0 or -err` |
| `0x04` | `SYS_GET_PID` | `() → pid` |
| `0x05` | `SYS_TASK_SLEEP` | `(ms) → 0` |
| `0x06` | `SYS_TASK_PSPAWN` | `(name_ptr) → {handle, pid}` |
| `0x07` | `SYS_TASK_KICKSTART` | `(args_struct_ptr) → handle` |
| `0x08` | `SYS_TASK_KILL` | `(task_handle) → 0 or -err` |
| `0x09` | `SYS_TASK_TMAKE` | `(entry, user_sp, arg) → tid` |
| `0x0A` | `SYS_TASK_TJOIN` | `(tid) → exit_status or -err` |
| `0x0B` | `SYS_TASK_TQUIT` | `(status) → never returns` |

### IPC (`0x10–0x1F`)

| Number | Name | Signature |
|--------|------|-----------|
| `0x10` | `SYS_PROC_SEND` | `(port, r1, r2, r3) → 0 or -err` |
| `0x11` | `SYS_PROC_RECV` | `(port) → sender_pid; r1–r3 payload` |
| `0x12` | `SYS_PROC_CALL` | `(port, r1, r2, r3) → r0–r3 reply` |
| `0x13` | `SYS_PROC_REPLY` | `(r0, r1, r2, r3) → 0 or -err` |
| `0x14` | `SYS_PROC_SENDX` | `(port, buf_len) → 0 or -err` — data in IPCX shared buffer |
| `0x15` | `SYS_PROC_CALLX` | `(port, buf_len) → {0, recv_len}` — reply in IPCX buffer |
| `0x16` | `SYS_PROC_REPLYX` | `(reply_handle, buf_len) → 0 or -err` |
| `0x17` | `SYS_PROC_RECVANY` | `(handles_ptr, count, timeout, result_ptr) → 0 or -err` |

### Ports & notifications (`0x20–0x2F`)

| Number | Name | Signature |
|--------|------|-----------|
| `0x20` | `SYS_PORT_CREATE` | `() → handle or -err` |
| `0x21` | `SYS_PORT_DESTROY` | `(handle) → 0 or -err` |
| `0x22` | `SYS_PORT_GRANT` | `(handle, pid) → 0 or -err` |
| `0x23` | `SYS_NTFN_CREATE` | `() → handle or -err` |
| `0x24` | `SYS_NTFN_SIGNAL` | `(ntfn_handle, bits) → 0 or -err` |
| `0x25` | `SYS_NTFN_WAIT` | `(ntfn_handle) → bits or -err` |
| `0x26` | `SYS_NTFN_POLL` | `(ntfn_handle) → bits or -err` |

### Memory (`0x30–0x3F`)

| Number | Name | Signature |
|--------|------|-----------|
| `0x30` | `SYS_MEMMAP` | `(addr, size, prot) → addr or -err` |
| `0x31` | `SYS_MEMUNMAP` | `(addr, size) → 0 or -err` |
| `0x32` | `SYS_MEMSHARE` | `(size) → id or -err` |
| `0x33` | `SYS_ATTACH` | `(id, addr) → addr or -err` |
| `0x34` | `SYS_MAPDEV` | `(phys, size) → addr or -err` |
| `0x35` | `SYS_DETACH` | `(addr, size) → 0 or -err` |
| `0x36` | `SYS_QUERYDEV` | `(handle, out_buf, len) → irq or -err` |
| `0x37` | `SYS_MPROTECT` | `(addr, size, prot) → 0 or -err` |
| `0x38` | `SYS_ASINJECT` | `(args_struct_ptr) → 0 or -err` |

### Interrupts (`0x40–0x4F`)

| Number | Name | Signature |
|--------|------|-----------|
| `0x40` | `SYS_IRQ_CLAIM` | `(irq_num) → 0 or -err` |
| `0x41` | `SYS_IRQ_BIND` | `(irq_num) → 0 or -err` |
| `0x42` | `SYS_IRQ_DONE` | `(irq_num) → 0 or -err` |

---

## Two-result returns

Some syscalls need to return two values. ZuzuOS uses `r0` and `r1` for this — the inline assembly wrapper captures both registers:

```c
static inline tspawn_result_t _pspawn(const char *name) {
    register uintptr_t r0 __asm__("r0") = (uintptr_t)name;
    register zpid_t    r1 __asm__("r1");
    __asm__ volatile("svc %[num]"
        : "+r"(r0), "=r"(r1)
        : [num] "i"(SYS_TASK_PSPAWN)
        : "memory");
    return (tspawn_result_t){ .task_handle = (handle_t)r0, .pid = r1 };
}
```

---

## Notes

- Thumb mode is not supported. The `SVC` immediate in Thumb is 8 bits, which would limit the syscall space and complicate extraction. All userspace code runs in ARM mode.
- Syscall number extraction reads the instruction word at `LR_svc - 4` through the D-cache. On Cortex-A15 the D-cache is PIPT, so this is safe. Self-modifying code that changes the `SVC` instruction after the I-cache has already fetched it would cause a mismatch, but that is not a supported use case.
