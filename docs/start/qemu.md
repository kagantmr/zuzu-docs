# Build and run in QEMU

!!! abstract "To write"
    From a clean checkout to a zzsh prompt on vexpress-a15 and virt.

## Build

- `make BOARD=vexpress-a15`, then `zuzu.img` and `sdimg` (make does not rebuild `zuzu.img` on its own)

## Run

- `make run`, the serial console, quitting QEMU

## Run the tests

- `make smoke`, what zztest checks, how long it takes
