---
name: pspawn
number: "0x06"
group: task
since: "1.0"
blocking: no
headers: [zuzu/spawn_args.h]
signature: "(args*) -> {handle, pid} or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to a `spawn_args_t`; carries the process name and its length"}
returns: "r0 = task handle slot in the caller's table; r1 = the new child's PID."
errors:
  - {code: ERR_BADPTR, when: "Args pointer invalid, or the name could not be copied"}
  - {code: ERR_BADARG, when: "`size` is smaller than `sizeof(spawn_args_t)`"}
  - {code: ERR_NOMEM, when: "Could not create the process, or the caller's handle table is full"}
see_also: [asinject, kickstart, pkill, wait]
---

Create a frozen child process. First step of the three-step spawn sequence:

 1. `pspawn` creates a new FROZEN process and returns its handle and PID.
 2. `asinject` fills the new process's address space with parsed ELF data.
 3. `kickstart` marks the process schedulable.

The child inherits the caller's first four handle slots (0–3), so it starts with the
name-server endpoint in slot 0 and can reach the system without further setup.

## Pitfalls

The returned process is FROZEN and will not run until `kickstart`. Because `asinject` is
init-only, ordinary processes spawn children by messaging init rather than driving the
sequence themselves.

The task handle is retained after `kickstart`: hold it to `pkill` or `wait` the child; it
is your only reference to it.