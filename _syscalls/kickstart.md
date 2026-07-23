---
name: kickstart
number: "0x07"
group: task
since: "1.0"
blocking: no
headers: [zuzu/spawn_args.h]
signature: "(args*) -> 0 or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to the argument struct"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "`size` < `sizeof(kickstart_args_t)`"}
  - {code: ERR_BADPTR, when: "Struct pointer is invalid"}
  - {code: ERR_BADHANDLE, when: "Handle is not a valid task handle"}
  - {code: ERR_BADTYPE, when: "Handle is not a task handle"}
  - {code: ERR_BUSY, when: "Task is not `FROZEN`"}
see_also: [asinject, pspawn]
---

Mark a FROZEN process as schedulable. Final step of the three-step process spawn sequence: 

 1. `pspawn` creates a new FROZEN process and returns its handle.
 2. `asinject` fills the new process's address space with parsed ELF data.
 3. `kickstart` marks the process as schedulable.

The argument struct has the following form and is in `spawn_args.h`:

```c
typedef struct
{
    uint32_t size;        /* sizeof(kickstart_args_t); wrapper sets it */
    handle_t task_handle; // handle of the target task
    uintptr_t entry;      // entry point address in the target task's address space
    uintptr_t sp;         // stack pointer value for the target task
    uint32_t r0_val;      // value to set in register r0 of the target task
    uint32_t r1_val;      // value to set in register r1 of the target task
} kickstart_args_t;
```

On success, the task handle is **freed**. The parent's handle is no longer valid, and subsequent accesses will return `ERR_BADHANDLE`.

## Pitfalls

Do not `kickstart` a process whose address space has not been filled by `asinject`, or it takes a prefetch abort and is killed. Ordinary processes cannot call `asinject`; to spawn a child, message the init process.
