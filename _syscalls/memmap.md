---
name: memmap
number: "0x30"
group: memory
since: "1.0"
blocking: no
headers: [zuzu/memprot.h, zuzu/types.h]
signature: "(handle | HANDLE_ANON, size, prot, flags) -> va or -err"
args:
  - {reg: r0, name: handle, desc: "`HANDLE_ANON` for fresh anonymous pages, or a shared-memory or device handle"}
  - {reg: r1, name: size, desc: "Anonymous: non-zero, a multiple of `PAGE_SIZE`, at most 32 MB. Device/SHM: must be 0"}
  - {reg: r2, name: prot, desc: "`VM_PROT_READ` / `VM_PROT_WRITE` / `VM_PROT_EXEC` only. No other bits, including `VM_PROT_USER`"}
  - {reg: r3, name: flags, desc: "Must be 0"}
returns: "The virtual address of the mapping."
errors:
  - {code: ERR_BADARG, when: "Non-zero `flags`; `prot` outside READ/WRITE/EXEC; W+X; `EXEC` on a device; anonymous size of 0 or not a multiple of `PAGE_SIZE`; non-zero size for a device or SHM handle"}
  - {code: ERR_OVERFLOW, when: "Anonymous size exceeds 32 MB"}
  - {code: ERR_BADHANDLE, when: "No such handle, or the backing object is null"}
  - {code: ERR_BADTYPE, when: "Handle is neither a device nor a shared-memory object"}
  - {code: ERR_BUSY, when: "That handle is already mapped"}
  - {code: ERR_NOMEM, when: "Address-space cursor exhausted, or the region could not be inserted"}
see_also: [memunmap, memprotect, shm_create, destroy]
---

Map memory into the caller. The first argument selects the backing: `HANDLE_ANON` for
fresh anonymous pages, or a shared-memory or device handle for an existing object. This one
call replaces the old `attach` and `mapdev`.

The three backings behave differently in ways the signature does not show.

**Anonymous:** `size` is required, must be non-zero and a multiple of `PAGE_SIZE`, and is
capped at 32 MB. Pages are demand-paged: the region is recorded with no physical backing and
frames are allocated on fault, one page at a time.

**Shared memory:** `size` must be 0; the object's own page count determines the mapping size,
so it is page-aligned by construction. `EXEC` is permitted.

**Device:** `size` must be 0 and `EXEC` is rejected. The capability's size is rounded up to a
page boundary, and the range is mapped eagerly as device memory rather than faulted in.

Anonymous and shared mappings are carved from one address-space cursor; device mappings come
from a second, bounded by `USER_DEVICE_LIMIT`. The two never interleave.

## Pitfalls

The kernel ORs in `VM_PROT_USER` itself, so a process cannot mint a kernel-privileged
mapping through `prot`. Passing that bit explicitly is rejected as `ERR_BADARG`.

Both cursors are bump allocators. Address space is never reclaimed: `memunmap` releases the
frames but not the virtual range, so a process that maps and unmaps in a loop will eventually
return `ERR_NOMEM` with most of its address space unused. Long-lived services should reserve
one large region up front and sub-allocate inside it rather than calling `memmap` repeatedly.

A handle can only be mapped once. A second `memmap` on the same device or shared-memory
handle returns `ERR_BUSY`, and it stays busy until `memunmap`. Two *handles* to one shared
object map independently, because `grant` clears the mapped address on the copy it creates.

Anonymous sizes are rejected if they are not page multiples, but device sizes are rounded up
silently. Do not assume the mapping is exactly `cap->size` bytes.

See [Memory]({{ '/kernel/memory/' | relative_url }}) for the full model.