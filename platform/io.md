---
layout: page
title: I/O & peripherals
section: Platform
prowl:
  - {title: "Drivers", url: "/zuzu-docs/2.x/os/drivers/"}
---

The kernel has almost no hardware drivers. It knows the interrupt controller, the timer, and a serial port for its own log output. Everything else — the console, storage, networking — is a **userspace driver** that reaches its hardware through a device capability.

## Device capabilities

For each device in the DTB, the kernel creates a `DeviceCap`: the compatible string, physical base address and size of the registers, and the interrupt number. These are given only to [`devmgr`]({{ '/os/devmgr/' | relative_url }}). A driver asks devmgr for a device by compatible string and receives a handle.

## A driver's life

1. **Get the handle** from devmgr (`DevmRequestDevice` with a list of compatible strings).
2. **Query it** with `DeviceQuery` to learn the interrupt and metadata.
3. **Map the registers** with `MemMap` on the device handle. The mapping is device memory and never executable.
4. **Bind the interrupt** with `IrqBind`, passing a notification and a bit. The kernel masks the interrupt line when it fires and signals the bit.
5. **Loop:** wait on the notification, service the device, call `IrqDone` to unmask.
6. **Register a path** (`/dev/...`) with the nameserver and serve requests on a port.

Because the handle is the authority, a driver that is not given one cannot see the hardware, and a driver that is given one cannot reach any other device.

## Drivers in 0.7

| Driver | Device | Serves |
|---|---|---|
| `pl011drv` | ARM PL011 UART | the console, `/dev/uart0`, `UART_CMD_*` |
| `pl181drv` | ARM PL181 MMCI (SD) | block reads and writes for fsd, `/dev/mmc0` (vexpress) |
| `emmc2drv` | Raspberry Pi 4 SD controller | the same, `/dev/mmc0` (Pi 4) |
| `lan9118drv` | SMSC LAN9118 | Ethernet frames for netd, `/dev/eth0` (vexpress) |

The Raspberry Pi 4 has a UART console and an SD driver, but no network driver in this release.

## Moving data

Interrupts and data take different paths. The interrupt wakes the driver through a notification; the data moves through **shared memory** that the driver and its client both map, with a notification or message to say that a ring has new entries. The kernel is only involved in the signal.

## DMA

No driver uses DMA in this version; transfers are copied through the FIFOs. A DMA design is for a later release.
