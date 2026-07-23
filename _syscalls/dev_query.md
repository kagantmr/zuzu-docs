---
name: dev_query
number: "0x22"
group: handles
signature: "(name/class, out*) -> handle or -err"
args:
  - {reg: r0, name: "name/class", desc: "Device name or class selector"}
  - {reg: r1, name: out, desc: "Pointer to a buffer for device metadata"}
returns: "A device handle."
errors:
  - {code: ERR_NOENT, when: "No matching device"}
  - {code: ERR_NOPERM, when: "Caller may not claim this device"}
  - {code: ERR_BADPTR, when: "Output pointer invalid"}
---

Look up a device by name or class and obtain a handle to it, along with its metadata (such as its IRQ). This is the gate to mapping device registers with `memmap` and binding its interrupt with `irq_bind`.
