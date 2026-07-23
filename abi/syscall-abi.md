---
layout: page
title: System call ABI
section: ABI
---

System calls are services offered by zuzu for userspace programs to request from the kernel that they are not allowed direct access to,
such as virtual memory management, IPC, devices or handle management. zuzu defines an Application Binary Interface (ABI) that dictates
how registers etc. must be configured for the system call to be reliably serviced.

## Calling convention

<div class="table-wrap">
<table>
<thead><tr><th>Field</th><th>Location</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Syscall number</td><td><code>SVC #n</code> immediate (lower 8 bits)</td><td>ARM mode only</td></tr>
<tr><td>Arg 0 / return value</td><td><code>r0</code></td><td>Modified by kernel on return</td></tr>
<tr><td>Arg 1</td><td><code>r1</code></td><td>Preserved if unused</td></tr>
<tr><td>Arg 2</td><td><code>r2</code></td><td>Preserved if unused</td></tr>
<tr><td>Arg 3</td><td><code>r3</code></td><td>Preserved if unused</td></tr>
<tr><td>Clobbered</td><td><code>r0</code> only</td><td><code>r1-r12</code>, <code>sp</code>, <code>lr</code> preserved</td></tr>
</tbody>
</table>
</div>

Negative `r0` on return indicates an error (check [error codes table]({{ '/abi/error-codes/' | relative_url }})). Zero or positive is success.

The kernel extracts the syscall number at `LR_svc - 4` (the instruction word before the return address) by masking the lower 8 bits. Arguments are already in `r0-r3` per AAPCS so call site wrappers need zero register shuffling.

*AArch64 actually doesn't need an extra memory access, instead the kernel can read the ESR and grab the SVC number.*

<hr>

## Alignment requirements

Any pointer passed as a syscall argument must be 4-byte aligned. Also, `sp` must be 8-byte aligned before syscall entry (but this is not enforced by the kernel).

## Notes

- The syscall number is limited to 8 bits. In ARM mode, the full 24-bit SVC immediate is available but only the lower 8 bits are used. In Thumb mode, the SVC immediate is natively 8 bits. Both modes are handled by checking the T bit in SPSR and reading a 2-byte or 4-byte instruction accordingly.
- Syscall number extraction reads the instruction word at `LR_svc - 4` through the D-cache.
- `CLREX` is issued at the top of each exception vector entry in `entry.S` to clear any outstanding exclusive monitor reservation from preempted LDREX/STREX sequences.
