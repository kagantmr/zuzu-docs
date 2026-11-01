# Run on real hardware

zuzu boots on real hardware from a FAT32 boot partition, the board's
firmware or boot ROM loads the kernel image as well as initrd and device tree from it,
and the kernel talks to you over a serial console.

## What a board needs

A board can boot from a card once its BSP provides:

- a `bsp/<arch>/<board>/` directory with the usual layout, linker script and
  manifests (see [Porting to a board](../guides/porting-board.md))
- `BOOT_FILES_<board>` in its `board.mk`, listing what goes on the boot
  partition such as the kernel image, initrd, DTB, and any config file the boot ROM
  reads
- a kernel driver for the board's console UART
- userspace drivers for the board's devices, listed in its manifests so they
  are staged into the image

A board without `BOOT_FILES_<board>` can only be booted through QEMU's
`-kernel`, and `make bootfs` says so.

## Prepare the card

    make BOARD=<board>
    make BOARD=<board> bootfs

`bootfs` stages everything in `BOOT_FILES_<board>` into `build/<board>/bootfs/`
plus the vendor firmware if the board has a firmware directory. Copy the
contents of that folder onto a FAT32-formatted card. This works the same on
every host.

`make BOARD=<board> bootimg` wraps the same files into `build/<board>/boot.img`.
On macOS this is a partitioned image you can `dd` to the whole card, on Linux
it is a bare FAT32 filesystem to write to an existing boot partition.

## Serial console

The kernel prints its boot log, panics and debug messages to a serial
console, and the shell runs on it too. This needs a kernel UART driver in
`drivers/uart/`, enabled through Kconfig. zuzu ships a PL011 driver
(`CONFIG_UART_PL011`) so a board with a different UART needs its own driver
there first.

Connect a 3.3 V USB serial adapter to the board's UART pins (TX to RX, RX to
TX, GND to GND) and open it at 115200 baud, 8N1. A good boot ends with the
`zzsh ~>` prompt or the `netd` DHCP bound message.

## Example: Raspberry Pi 4

The Pi 4 boots through its closed-source GPU firmware, which zuzu does not
ship. Fetch it once into `firmware/`; `bootfs` picks it up from there:

```
    make rpi4-firmware
    make BOARD=rpi4
    make BOARD=rpi4 bootfs
```

The boot partition then holds `start4.elf`, `fixup4.dat`, `config.txt`,
`zuzu.img`, `initrd.cpio` and `bcm2711-rpi-4-b.dtb`.

The board's `config.txt` sets up the console: it enables the UART, pins the
UART clock to 48 MHz so 115200 baud stays exact, and moves Bluetooth off the
PL011 so it reaches the header pins. Connect the serial adapter to GPIO 14
(TX, pin 8), GPIO 15 (RX, pin 10) and a ground pin (e.g. pin 6).

zuzu builds for the Pi 4 in two variants:

- AArch32 (the default): `make BOARD=rpi4`. QEMU cannot boot this one, so it
  is tested on real hardware only.
- AArch64: `make ARCH=aarch64 BOARD=rpi4`, which can also boot under QEMU's
  `raspi4b` machine.

If the Pi boots but prints nothing, check `enable_uart=1` in `config.txt` and
uncomment `uart_2ndstage=1` to see the firmware's own log before the kernel
starts.