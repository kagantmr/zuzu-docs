# Build and run in QEMU

## Build

zuzu builds with GNU Make 4.0 or newer. macOS ships 3.81, so install `make`
from Homebrew and use `gmake` wherever this page says `make`.

You need:

- a cross-compiler for the board's architecture (e.g. `arm-none-eabi-gcc`)
- QEMU for that architecture (e.g. `qemu-system-arm`)
- Python 3; `pip install -r requirements.txt` adds menuconfig, the ZXF tools
  and the font pipeline
- `dtc`, `cpio`, and an SD image tool (`hdiutil` on macOS, `mkfs.fat` and
  `mtools` elsewhere)

This example boots zuzu on QEMU's `vexpress-a15` machine, see
[Supported boards](boards.md) for the others.

`make BOARD=vexpress-a15` compiles the kernel and the boot programs and
produces `zuzu.elf` and `initrd.cpio`. 

`make BOARD=vexpress-a15 sdimg` builds
the SD card image, and `make BOARD=vexpress-a15 run` boots it, rebuilding
`zuzu.img` first. `make BOARD=vexpress-a15 deploy` does all three.

## Run

`make BOARD=vexpress-a15 run` starts QEMU with the kernel and boot programs.
The boot succeeded when the `zzsh ~>` prompt appears; from there you can run
programs from the shell. If QEMU reports that `sd.img` is missing, build it
with `make BOARD=vexpress-a15 sdimg`.

## Run the tests

`zztest` is the syscall test suite, and CI runs it on every push. Either type
`zztest` at the shell, after netd prints `network up:` so its startup doesn't
show up as page drift, or run it from the host:

    make BOARD=vexpress-a15 smoke

This boots QEMU, runs zztest and exits nonzero on failure. Boards without
zztest on their SD card only check that the shell prompt comes up.

zztest runs the whole suite three times, which takes about a minute. It fails
on any failed check, or if free pages drift between the last two passes. It
covers:

- **svc basics**: Yield, Sleep, bad syscall numbers, syspage
- **handles**: types, perms, markers, generations, table limits
- **memory**: anon and object maps, Protect, W^X, contiguous and uncached memory
- **events**: Signal and Wait, broadcast, bound bits, DEAD on close
- **event masks**: masked waits and `WAIT_ALL`
- **ipc**: Call and Reply, message limits, handle grants, port and server death
- **multi-observer binds**: up to four observers per object
- **tasks**: create, start, kill, exit status, priority and timeslice limits
- **priorities**: preemption, round-robin, priority inheritance, wake order
- **tcb priority**: base and max priority in the TCB
- **spaces and faults**: child Spaces, fault reporting, resume after a fault
- **suspend and inspect**: Suspend, Resume, GetRegs, SetRegs
- **waiter re-sort**: raising a waiter's priority moves it up the queue
- **hold**: parking calls with Hold and answering them with ReplyTo
- **owner destroy**: other holders get DEAD
- **injectobj**: mapping objects into another Space
- **msg writer and reader**: msg library encoding and overflow
- **hardening**: resource exhaustion and recovery
- **call timeout**: timed calls and late replies
- **map permissions**: which perms each mapping needs, sealing
- **event bit reuse**: bound bits freed and reused
- **recursive events**: events bound to events
- **dma**: DmaMap, DmaSync, DmaAdopt, DMA queries
- **kitten isolation**: memory protection between Spaces
- **task lifetime**: zombie tasks, freeing task slots
- **many threads**: 12 threads, each with its own message buffer and TLS
- **ipc stress**: random calls with data checks, concurrent clients, FIFO order
- **hostile arguments**: bad pointers and bad handles
- **sync library**: Zone, Semaphore, CondVar
- **leaks**: no lost pages after create/destroy rounds