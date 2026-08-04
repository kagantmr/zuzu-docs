---
name: AsInject
number: "0x38"
group: memory
since: "1.0"
blocking: no
headers: [zuzu/spawn_args.h]
signature: "(args*) -> 0 or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to the injection struct; its first field is a caller-set size"}
returns: "0 on success."
errors:
  - {code: ERR_NOPERM, when: "For a non-privileged caller"}
  - {code: "ERR_BADPTR / ERR_BADARG", when: "For a bad struct"}
---

Fill a frozen process's address space from parsed ELF data. Second step of the three-step process spawn sequence: 
 1. `PSpawn` creates a new FROZEN process and returns its handle.
 2. `AsInject` fills the new process's address space with parsed ELF data.
 3. `Kickstart` marks the process as schedulable.
This is the privileged step between `PSpawn` and `Kickstart`. The asinject struct is `AsInjectArgs`, defined in `spawn_args.h`:

```c
typedef struct
{
    uint32_t size;        /* sizeof(AsInjectArgs); wrapper sets it */
    Handle taskHandle;     // handle of the target task
    VirtAddr DestVAddr;     // destination virtual address in the target task's address space
    const void *src_buf;  // pointer to the source buffer in the current task's address space
    size_t len;           // length of the source buffer in bytes
    MemProt prot;         // memory protection flags for the destination mapping (e.g., PROT_READ | PROT_WRITE)
    uint32_t flags;       // ASINJECT_FLAG_* bits; 0 for the original copy-in behavior
} AsInjectArgs;
```

`flags` accepts `ASINJECT_FLAG_RESERVE`: instead of copying `len` bytes from `src_buf`, it
reserves `[DestVAddr, DestVAddr + len)` as demand-zero anonymous memory in the target address
space. `src_buf` must be `NULL` when this flag is set, since no bytes are copied up front.

## Pitfalls

Only the init process may call this. Ordinary processes spawn children by messaging init, not by calling `AsInject` directly. The init process is granted the permission via the `PROC_FLAG_INIT` flag in the PCB.
