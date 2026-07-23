---
name: dev_query
number: "0x22"
group: handles
since: "1.0"
blocking: no
signature: "(handle, out*, buf_len) -> irq or -err"
args:
  - {reg: r0, name: handle, desc: "Handle of a device capability"}
  - {reg: r1, name: out, desc: "Buffer receiving the DTB compatible string"}
  - {reg: r2, name: buf_len, desc: "Size of out, at least DEV_COMPAT_MAX"}
returns: "The device's IRQ number."
errors:
  - {code: ERR_BADARG, when: "handle is 0, or buf_len is 0"}
  - {code: ERR_BADHANDLE, when: "No such handle, or null device capability"}
  - {code: ERR_BADTYPE, when: "Handle is not a device handle"}
  - {code: ERR_BADPTR, when: "Output buffer is not writable"}
see_also: [memmap, irq_bind, destroy]
---

Look up a device by name or class along with its metadata (such as its IRQ). This is the gate to mapping device registers with `memmap` and binding its interrupt with `irq_bind`.

## Pitfalls

The buffer pointed to by `out` must be large enough to hold the device metadata. It must be of at least 33 bytes.