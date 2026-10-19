# Syscall ABI

!!! abstract "To write"
    The register-level contract, per architecture. Facts only; the C view is in Syscalls.

## ARMv7-A

- syscall number in r12; `svc #0x112023` (ARM) or `svc #0x23` (Thumb), the 2023-11-20 magic
- arguments in r0–r3, results in r0–r3, r0 is the status (negative = error)
- registers preserved across a call

## Stability

- numbers never reused within a major version; what changed from 1.x
