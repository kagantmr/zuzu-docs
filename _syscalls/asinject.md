---
name: asinject
number: "0x38"
group: memory
since: "1.0"
blocking: no
signature: "(args*) -> 0 or -err"
args:
  - {reg: r0, name: args, desc: "Pointer to the injection struct; its first field is a caller-set size"}
returns: "0 on success."
errors:
  - {code: ERR_NOPERM, when: "For a non-privileged caller"}
  - {code: "ERR_BADPTR / ERR_BADARG", when: "For a bad struct"}
---

Fill a frozen process's address space from parsed ELF data. This is the privileged step between `pspawn` and `kickstart`. The asinject struct has the following form and is in {{ site.abi_source }}/spawn_args.h:

```c
typedef struct
{
    uint32_t size;        /* sizeof(asinject_args_t); wrapper sets it */
    handle_t task_handle; // handle of the target task
    uintptr_t dst_va;     // destination virtual address in the target task's address space
    const void *src_buf;  // pointer to the source buffer in the current task's address space
    size_t len;           // length of the source buffer in bytes
    uint32_t prot;        // memory protection flags for the destination mapping (e.g., VM_PROT_READ | VM_PROT_WRITE)
} asinject_args_t;
```

## Pitfalls

Only the init process may call this. Ordinary processes spawn children by messaging init, not by calling `asinject` directly. The init process is granted the permission via the `PROCESS_FLAG_INIT` in the PCB.
