# newlib tier

!!! warning "Carried over from 1.x"
    This page was written for zuzu 1.x and still mentions parts that changed in 2.x (sysd, v1 syscalls). It needs a review.

zuzuOS exposes two application runtimes: 

1. **The Zuzu C Runtime (ZCRT)** speaks zuzu's own vocabulary: capabilities, ports, labels, long messages etc.
and evolves alongside the system. 
2. The **newlib tier** is a POSIX shim layered
on top of it, so that C programs written for a Unix-shaped world can be built
and run with little or no modification.

Pick newlib when you are porting existing code, or when what you need is
ordinary file and text handling. Pick ZCRT when you need something POSIX
cannot express such as creating a port, registering a service, granting a
capability, reading a caller's label or when you want the overhead-free
path.

The two compose, but not completely. A newlib program can call ZCRT
functions directly; see [Mixing the tiers](#mixing-the-tiers) for where that
holds and where it does not.

## What the shim provides

The shim implements newlib's system-call layer against zuzuOS services, so
the standard headers work as far as those services reach.

| Header | Coverage |
| --- | --- |
| `stdio.h` | full for streams backed by `fsd`; `printf` family, `fopen`/`fread`/`fwrite`/`fclose`, `getchar`, `scanf` |
| `stdlib.h` | full — `malloc` family via `sbrk`, `strtol`/`strtod`, `qsort`, `abs`, `exit` |
| `string.h` | full — no OS dependency |
| `ctype.h` | full — no OS dependency |
| `errno.h` | full |
| `fcntl.h` | `open` with `O_RDONLY`/`O_WRONLY`/`O_CREAT` |
| `unistd.h` | `read`, `write`, `close`, `lseek`, `unlink`, `getpid`, `sleep` |
| `sys/stat.h` | `stat`, `fstat`, `mkdir` |
| `time.h` | partial |

Anything that is pure computation over memory like `string.h`, `ctype.h`, the
formatting side of `stdio.h`, `qsort` works because it never leaves the
process. Everything else is a request to a zuzuOS service.

## How it maps

The shim is thin, and worth understanding rather than treating as a black
box since each POSIX call becomes an IPC message to the service that owns the
resource.

| POSIX call | Becomes |
| --- | --- |
| `open`, `read`, `write`, `close`, `lseek` | IPC to `fsd`, the filesystem service, over a shared-memory buffer |
| `stat`, `fstat`, `mkdir`, `unlink` | IPC to `fsd` |
| `printf`, `putchar`, `fputs` (to stdout) | long message to the tty registered at `/dev/uart0` |
| `getchar`, `scanf` | long-message call to the same tty; the driver's read is non-blocking, so `getchar` returns `EOF` between keystrokes |
| `malloc`, `free` | `sbrk` against the process heap; no IPC |
| `getpid` | `ZuzuGetPid`, a direct syscall |
| `exit` | `ZuzuPQuit` |

## Gaps

Some of these are stubs that return an error; others are headers the
toolchain does not ship at all, which fail at compile time rather than run
time. Both are listed so a port fails predictably.

### Missing headers

| Header | Status |
| --- | --- |
| `dirent.h` | present but guarded by `#error` in bare-metal newlib; no `DIR`, `opendir`, or `readdir` |
| `regex.h` | header ships, but `regcomp`/`regexec`/`regfree` are undefined at link time |
| `sys/socket.h`, `netinet/in.h`, `arpa/inet.h` | absent entirely; newlib has no networking layer |
| `pthread.h` | absent; use ZCRT threads |

`fsd` already exposes directory enumeration (`FSD_READDIR`), so a `dirent`
shim over it is a thin adapter rather than new machinery. Sockets would layer
over `netd` the same way. Neither exists yet.

### Stubbed system calls

These link successfully and fail at runtime with `ENOSYS`:

| Call | Why |
| --- | --- |
| `fork` | zuzuOS has no address-space duplication. Process creation is `PSpawn` (empty frozen task) -> `exec_inject` (loader fills it) -> `Kickstart`; there is no copy-the-parent step and no reason to add one. |
| `execve` | replacing an image in place is not how loading works. |
| `kill`, `signal`, `raise` | signals are a UNIX artifact. zuzuOS uses messages and notifications; termination is `ZuzuPKill` against a task handle held by the parent. |
| `wait`, `waitpid` | use `ZuzuWait`, which has different semantics. |
| `link`, `symlink`, `readlink`, `chown` | not modelled by `fsd`. |

**`fork` will not be emulated** due to its address space copying step, as
it is an unneeded and costly operation for the sake of zuzuOS.

## Mixing the tiers

A newlib program is an ordinary zuzuOS process. It has a handle table, a slot
0 pointing at the nameserver, and a label assigned by `sysd`. Nothing stops it
calling ZCRT functions, and porting often means doing exactly that for the
parts POSIX cannot reach.

What composes cleanly:

- Looking up and calling services (`LookupService`, `ZuzuMsgCall`,
  `ZuzuMsgLcall`) alongside normal `printf` and `malloc`.
- Creating ports, granting capabilities, registering a service;  none of
  which touches libc state.
- `ZuzuSleep` next to newlib's timing functions.

What to be careful with:

- **Two paths to the same resource.** Reading a file through `fsd_client`
  directly while also holding it open through `fopen` means two independent
  file positions and no coherence between them. Pick one per file.
- **The long-message buffer is shared.** `LmsgBuf()` is per-thread, and
  `printf` uses it for output. A ZCRT call that stages data there and then
  calls `printf` before sending will find the buffer overwritten.
- **`errno` is not thread-aware yet.** The shim uses newlib's non-reentrant
  system calls, so a process running several threads that both fail a libc
  call will race on `errno`.

The rule of thumb: use POSIX for computation and file I/O, ZCRT for anything
involving capabilities or IPC, and do not assume libc knows about state you
changed underneath it.
