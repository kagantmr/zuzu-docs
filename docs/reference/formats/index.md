# Binary formats

!!! warning "Carried over from 1.x"
    This page was written for zuzu 1.x and still mentions parts that changed in 2.x (sysd, v1 syscalls). It needs a review.

zuzuOS runs two executable formats. **ZXF** is the native one, produced by the
build system and loaded by the kernel. **ELF** is what the toolchain emits and
what the debugger reads, and remains fully supported by `sysd`.

| Component | Accepts |
| --- | --- |
| kernel (`KernelProcessLoad`) | ZXF only |
| `sysd` (`exec_inject`) | ZXF and ELF |
| `gdb` | ELF |

## Why two

The kernel loads exactly two binaries: `sysd` and `devmgr`. Supporting ZXF alone there replaces the ELF parser.

`sysd` keeps both because the convenience is real. Anything the toolchain
emits runs without a conversion step, a misbehaving binary can be tried in
both formats to isolate whether the converter is at fault. Shared objects, when they arrive, will also be subject to this.

The cost is two loader paths that must not drift. Both reduce to the same
thing: a list of `{source, vaddr, file_size, mem_size, permissions}` plus an
entry point. The format-specific code ends at producing that list, and the
injection logic exists once.

## ZXF

See the [ZXF reference](zxf) for the full format. In brief: a fixed 64-byte
header, a segment table of 24-byte entries, an optional block table, and the
segment bytes packed back to back. It carries a CRC32 over the whole file and
a content-derived build identifier.

What it does not carry is everything a loader never reads: section headers,
symbol tables, string tables, `.ARM.attributes`, `.comment`. For `netd`,
a representative service, that is the difference between 57,088 bytes as ELF
and 38,221 as ZXF. The segment data is byte-identical; the 33% is metadata.

## ELF

Standard 32-bit little-endian ARM ELF, `ET_EXEC`, statically linked. `sysd`
reads the ELF header for the entry point and walks program headers for
`PT_LOAD` segments; nothing else in the file is consulted.

ELF remains the debugging artifact. `elf2zxf` does not relocate, segment
virtual addresses are copied unchanged so symbols from the ELF line up with
a running ZXF binary built from it:

```
gdb build/initrd/bin/netd
(gdb) target remote :1234
```

Keep the pair in step. If one is rebuilt and the other is not, symbols point
at the wrong addresses with no warning.

## The build pipeline

`elf2zxf` is a host-side Python script requiring `pyelftools`:

```
scripts/elf2zxf.py <input> [-o output.zxf]
```

Input must be `ET_EXEC`, `EM_ARM`, 32-bit, little-endian. The conversion is a one-to-one copy of `PT_LOAD` headers into segment table entries.

Note the permission remap: ZXF uses R = bit 0, W = bit 1, X = bit 2, while
ELF's `PF_R`/`PF_W`/`PF_X` are 4/2/1. The two agree for `R|X` and disagree for
`R|W`. Any tool touching both must remap rather than copy.

## Not supported

- **Dynamic linking.** Everything is statically linked today. ZXF reserves a
  `DYNLINK` block and ELF has `.dynamic`, but neither is implemented.
- **PIE / position-independent executables.** `elf2zxf` rejects `ET_DYN`, and
  neither loader relocates.
- **Compression.** ZXF reserves a `COMPRESSED` flag; nothing produces or
  honours it.
- **Signatures.** ZXF reserves a `SIGNATURE` block for driver verification,
  intended for `devmgr` to check before granting device access. Not
  implemented.
