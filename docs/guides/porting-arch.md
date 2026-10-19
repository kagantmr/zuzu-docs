# Porting to a new architecture

!!! abstract "To write"
    What a new arch must provide under `arch/`. aarch64, RISC-V and x86 are the targets.

## The HAL contract

- arch headers, `make hal-check`, asm-offsets

## Traps and the syscall ABI

- ArchInvokeSvc*, frame layout, trap_frame = kstack_top − sizeof(CpuState)

## Timer and counter

- one-shot deadline, user-readable counter
