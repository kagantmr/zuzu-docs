---
name: Kickstart
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
  - {code: ERR_BADARG, when: "`size` < `sizeof(KickstartArgs)`"}
  - {code: ERR_BADPTR, when: "Struct pointer is invalid"}
  - {code: ERR_BADHANDLE, when: "Handle is not a valid task handle"}
  - {code: ERR_BADTYPE, when: "Handle is not a task handle"}
  - {code: ERR_BUSY, when: "Task is not `FROZEN`"}
see_also: [AsInject, PSpawn]
---

Mark a FROZEN process as schedulable. Final step of the three-step process spawn sequence: 

 1. `PSpawn` creates a new FROZEN process and returns its handle.
 2. `AsInject` fills the new process's address space with parsed ELF data.
 3. `Kickstart` marks the process as schedulable.

The argument struct is `KickstartArgs`, defined in `spawn_args.h`:

```c
typedef struct
{
    uint32_t size;        /* sizeof(KickstartArgs); wrapper sets it */
    Handle taskHandle; // handle of the target task
    VirtAddr entry;      // entry point address in the target task's address space
    VirtAddr sp;         // stack pointer value for the target task
    uint32_t r0_val;      // value to set in register r0 of the target task
    uint32_t r1_val;      // value to set in register r1 of the target task
} KickstartArgs;
```

## Pitfalls

Do not `Kickstart` a process whose address space has not been filled by `AsInject`, or it takes a prefetch abort and is killed. Ordinary processes cannot call `AsInject`; to spawn a child, message the init process.
