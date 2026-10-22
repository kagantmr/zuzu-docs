---
layout: page
title: Getting started
section: Overview
prowl:
  - {title: "Start", url: "/zuzu-docs/2.x/start/"}
---

This page gets zuzu 1.x (Loaf) and zuzuOS 0.7 built and running under QEMU. For the current release see [2.x](/zuzu-docs/2.x/).

## Requirements

- `arm-none-eabi` GCC toolchain
- QEMU with `qemu-system-arm`
- GNU make (`gmake` on macOS and BSD)
- Python 3 (for the build helpers)
- Optional: `mtools` and `dosfstools` to build the SD card image

## Get the code

```
git clone https://github.com/kagantmr/zuzu
cd zuzu
git checkout zuzu-v1.2.0-loaf
```

## Build

```
gmake                       # vexpress-a15, the default board
gmake BOARD=rpi4            # Raspberry Pi 4
gmake menuconfig            # change kernel options for the board
```

`gmake all` builds the kernel, every userspace program, and the initrd. Output goes to `build/arm-<board>/`.

## Run

```
gmake run                   # boot under QEMU
gmake debug                 # boot stopped, gdb on tcp::1234
gmake deploy                # rebuild everything, recreate the SD image, run
```

You should see the kernel banner, sysd starting the servers, and then the shell prompt. Try `help`.

## SD card and storage

The SD card image is a FAT image that fsd serves. Files placed under `ZUZUSD/` (or `sdroot/` on later releases) are copied into it by `gmake sdimg`. Programs on the card can be run from the shell by path.

## Real hardware

For a Raspberry Pi 4, `gmake BOARD=rpi4 rpi4-firmware` downloads the Pi firmware, and `gmake BOARD=rpi4 img` produces a raw image for the SD card. In this release the Pi gets a serial console only.

## Next steps

- [Kernel architecture]({{ '/kernel/architecture/' | relative_url }})
- [Boot sequence]({{ '/platform/boot/' | relative_url }})
- [Writing a service]({{ '/sdk/writing-a-service/' | relative_url }})
