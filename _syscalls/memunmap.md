---
name: memunmap
number: "0x31"
group: memory
since: "1.0"
blocking: no
headers: [zuzu/memprot.h, zuzu/types.h]
signature: "(addr) -> 0 or -err"
args:
  - {reg: r0, name: addr, desc: "Base address of the region to unmap. Must be exactly the base, not an address inside it"}
returns: "0 on success."
errors:
  - {code: ERR_BADARG, when: "No region starts at that address"}
  - {code: ERR_NOPERM, when: "The region is pinned"}
see_also: [memmap, memprotect, destroy]
---

Unmap a whole region by its base address. The address must match a region's base exactly;
an address inside a region is rejected rather than splitting it.

What happens to the backing depends on how the region was created.

**Anonymous:** Every page that is actually backed is returned to the physical allocator.
Because anonymous regions are demand-paged, pages that were never touched have no frame and
are skipped.

**Shared memory and device:** The frames are not freed since they belong to the object, not the
mapping. Instead the owning handle's recorded address is cleared, which makes the object
mappable again and releases the `ERR_BUSY` that `memmap` and `destroy` return while a handle
is mapped.

## Pitfalls

Whole-region only. You cannot unmap part of a mapping; partial unmap is a planned additive
call (`memunmap_range`) in a later 1.x kernel.

Unmapping does not release the handle. The object's reference count is unchanged and the
handle remains valid and remappable.

Virtual address space is not reclaimed. The region is removed and the page table entries
cleared, but the address-space cursor does not move back, so the range is never reused. See
the same note on [memmap]({{ '/abi/syscall/memmap/' | relative_url }}).