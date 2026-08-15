---
layout: page
title: ZXF
section: SDK
---

The ****Zuzu eXecutable Format (ZXF)** is the native binary format for zuzuOS executables.

| | |
| --- | --- |
| **Magic** | `7A 5A 58 46` (`zZXF`) |
| **Version** | `0x01` |
| **Header size** | 64 bytes, fixed |
| **Endianness** | little |
| **Since** | zuzuOS v0.8 |

ZXF replaces ELF as the format the kernel loads. It carries only what a
loader needs: an entry point, a segment table, and the segment bytes as well as
an integrity checksum and a build identifier. 

For `netd`, a representative service: 57,088 bytes as ELF, 38,221 bytes as
ZXF. The segment data is byte-identical between the two; the difference is
metadata the loader never touched. Format overhead is 112 bytes (a 64-byte
header plus two 24-byte segment entries) against roughly 19 KB of unused ELF
structure.

## Who parses ZXF

| Component | Formats accepted |
| --- | --- |
| kernel (`KernelProcessLoad`) | ZXF only |
| `sysd` (`exec_inject`) | ZXF, ELF |

The kernel loads exactly two binaries: `sysd` and `devmgr`
which are all static and all produced by the zuzu build system. Using ZXF here allows
for a smaller parser on the kernel side as well as a smaller `sysd` and `devmgr` size.


## File layout

```
offset 0    ZXF header            64 bytes, fixed
            segment table         seg_count * 24 bytes
            block table           block_count * 12 bytes (absent if block_count = 0)
            block data            variable
            segment data          raw bytes, packed
```

All offsets are absolute from the start of the file. Segment data is packed
back-to-back with no padding, so segments are copied into the target address
space by `asinject`, never mapped directly from the file, so file alignment
buys nothing.

## Header

| Offset | Size | Field | Description |
| --- | --- | --- | --- |
| 0 | 4 | `magic` | `7A 5A 58 46` |
| 4 | 1 | `version` | format version, currently `0x01` |
| 5 | 1 | `arch` | target architecture (see below) |
| 6 | 1 | `flags` | binary flags (see below) |
| 7 | 1 | `reserved` | zero |
| 8 | 8 | `entry` | entry point VA |
| 16 | 8 | `load_base` | base VA of the image |
| 24 | 4 | `image_size` | memory span when fully loaded |
| 28 | 2 | `seg_count` | number of segment table entries |
| 30 | 2 | `block_count` | number of block table entries |
| 32 | 4 | `seg_table_offset` | file offset to the segment table |
| 36 | 4 | `block_table_offset` | file offset to the block table (0 if `block_count` is 0) |
| 40 | 4 | `checksum` | CRC32 over the whole file, this field treated as zero |
| 44 | 16 | `build_id` | build identifier |
| 60 | 4 | `reserved2` | zero |

```c
typedef struct {
    uint8_t  magic[4];
    uint8_t  version;
    uint8_t  arch;
    uint8_t  flags;
    uint8_t  reserved;
    uint64_t entry;
    uint64_t load_base;
    uint32_t image_size;
    uint16_t seg_count;
    uint16_t block_count;
    uint32_t seg_table_offset;
    uint32_t block_table_offset;
    uint32_t checksum;
    uint8_t  build_id[16];
    uint8_t  reserved2[4];
} ZXFHeader;
```

`entry` and `load_base` are 64-bit for cross-architecture use; on ARMv7-A the
upper four bytes are zero. `load_base` is the lowest `vaddr` across all segments. For a static
`ET_EXEC`-derived binary the segments carry absolute addresses. `image_size` is the **span**: `max(vaddr + mem_size) − min(vaddr)`, including any gaps between segments. It is what a loader reserves before mapping individual segments, not the sum of segment sizes.

`checksum` is CRC32 over the entire file with bytes 40–43 treated as zero. A
loader verifies this before reading anything else; a mismatch is a corrupt
file and aborts the load.

`build_id` is the first 16 bytes of the SHA-256 of the whole file, computed
with both `checksum` (bytes 40–43) and `build_id` (bytes 44–59) zeroed. It is
content-derived rather than random, so builds are reproducible: identical
input produces an identical file, and the build system can tell that nothing
changed.

### `arch` values

| Value | Architecture |
| --- | --- |
| `0x01` | ARMv7-A |
| `0x02` | ARMv8-A (AArch64) |
| `0x03` | x86-64 |
| `0x04` | ARMv7-M (tinyZuzu) |
| `0x05` | RISC-V |
| `0x06` | PowerPC |

A loader compares this against the running system and aborts on mismatch.
Only `0x01` is produced or accepted today.

### `flags` bits

| Bit | Name | Meaning |
| --- | --- | --- |
| 0 | `PIC` | position-independent; `load_base` is ignored |
| 1 | `STATIC` | no dynamic linking; no DYNLINK block will be present |
| 2 | `HAS_DEBUG` | a DEBUGINFO block is present |
| 3 | `COMPRESSED` | segment data is stored compressed |
| 4–7 | — | reserved, must be zero |

**Warning:** `elf2zxf` sets `STATIC` and nothing else. `PIC`, `HAS_DEBUG`, and `COMPRESSED` are reserved for future use and are not produced or honoured today.

## Segment table

Each entry is 24 bytes. Every entry is a load segment; there is no type field
and nothing to filter.

| Offset | Size | Field | Description |
| --- | --- | --- | --- |
| 0 | 4 | `file_offset` | offset from start of file to this segment's data |
| 4 | 4 | `file_size` | bytes stored in the file |
| 8 | 8 | `vaddr` | virtual address to map at |
| 16 | 4 | `mem_size` | bytes occupied in memory; >= `file_size` |
| 20 | 1 | `flags` | R = bit 0, W = bit 1, X = bit 2 |
| 21 | 1 | `align` | alignment as log2 (12 = 4096-byte pages) |
| 22 | 2 | `reserved` | zero |

```c
typedef struct {
    uint32_t file_offset;
    uint32_t file_size;
    uint64_t vaddr;
    uint32_t mem_size;
    uint8_t  flags;
    uint8_t  align;
    uint16_t reserved;
} ZXFSegment;
```

ZXF uses R = 1, W = 2, X = 4; ELF's `PF_R`/`PF_W`/`PF_X` are 4/2/1. Converters must remap rather than copy.

Where `mem_size > file_size`, the loader zero-fills the tail. Initialised data and BSS share one `R|W` segment:
`file_size` bytes read from the file, followed by `mem_size − file_size` bytes of zeros that occupy no file space.

## Block table

Each entry is 12 bytes. Blocks carry optional metadata that is not required to
load and run the binary.

| Offset | Size | Field | Description |
| --- | --- | --- | --- |
| 0 | 2 | `type` | block type identifier |
| 2 | 2 | `flags` | `REQUIRED` = `0x0001`, `OPTIONAL` = `0x0000` |
| 4 | 4 | `offset` | file offset to the block's data |
| 8 | 4 | `size` | size of the block data in bytes |

A loader that encounters a `REQUIRED` block whose type it does not recognise
must abort. An unrecognised `OPTIONAL` block is skipped silently. New block
types can therefore be introduced without breaking existing loaders, provided
they are marked `OPTIONAL`.

### Block type registry

| Value | Name | Consumer | Status |
| --- | --- | --- | --- |
| `0x0001` | `DYNLINK` | loader | reserved, not implemented |
| `0x0002` | `HINTS` | `sysd` | reserved, not implemented |
| `0x0003` | `DEBUGINFO` | debugger | reserved, not implemented |
| `0x0004` | `SIGNATURE` | `devmgr` | reserved, not implemented |

No block types are produced or consumed today. `elf2zxf` emits
`block_count = 0` and omits the block table entirely.

## Loading sequence

1. Verify `magic`, `version`, and `arch`.
2. Recompute CRC32 over the file with bytes 40–43 zeroed; compare against
   `checksum`. Abort on mismatch.
3. Read `seg_count` entries at `seg_table_offset`.
4. For each segment: copy `file_size` bytes from `file_offset` to `vaddr`
   with the given permissions, then zero-fill `mem_size − file_size` bytes
   past the end.
5. Walk the block table if `block_count` is non-zero; abort on an
   unrecognised `REQUIRED` block, skip unrecognised `OPTIONAL` ones.
6. Set up the stack and start at `entry`.

## elf2zxf

`scripts/elf2zxf.py` converts a linked ELF into ZXF on the build machine. It
requires `pyelftools`.

```
elf2zxf.py <input.elf> [-o output.zxf]
```

Input must be `ET_EXEC`, `EM_ARM`, 32-bit, little-endian. The conversion is a one-to-one copy of `PT_LOAD` program headers into segment table entries. Everything outside `PT_LOAD` is discarded.

Field derivation:

| ZXF field | Source |
| --- | --- |
| `entry` | `e_entry` |
| `load_base` | `min(p_vaddr)` over `PT_LOAD` |
| `image_size` | `max(p_vaddr + p_memsz) − min(p_vaddr)` |
| `seg_count` | number of `PT_LOAD` headers |
| `flags` | `STATIC` |
| `block_count` | 0 |

The two computed fields must be written in order, since each covers the
previous:

1. Assemble the file with `checksum` and `build_id` both zeroed.
2. Compute SHA-256 over the buffer; write the first 16 bytes to `build_id`.
3. Compute CRC32 over the buffer, `checksum` still zeroed; write it to
   `checksum`.

The CRC therefore covers the `build_id`; the `build_id` does not cover the
CRC.
