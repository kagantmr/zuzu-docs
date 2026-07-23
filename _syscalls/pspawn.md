---
name: pspawn
number: "0x06"
group: task
signature: "(name) -> 0 or -err"
args:
  - {reg: r0, name: name, desc: "Pointer to the name string"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "Failed to copy the name"}
  - {code: ERR_NOMEM, when: "Failed to create/fill the PCB, or the handle vector is full"}
  - {code: ERR_BADPTR, when: "String pointer is invalid"}
---

Create a frozen child process. First step of the three-step process spawn sequence: 

 1. `pspawn` creates a new FROZEN process and returns its handle.
 2. `asinject` fills the new process's address space with parsed ELF data.
 3. `kickstart` marks the process as schedulable.

## Pitfalls

This creates a FROZEN process that will not be scheduled. To fill its address space, the init process must call `asinject` with parsed ELF data, then `kickstart` it.
