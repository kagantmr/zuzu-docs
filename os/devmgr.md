---
layout: page
title: devmgr
section: zuzuOS
prowl:
  - {title: "Drivers", url: "/zuzu-docs/2.x/os/drivers/"}
---

`devmgr` is the device manager. The kernel loads it and injects one **device capability** per device it found in the DTB: the compatible string, the physical base address and size of the registers, and the interrupt. No other process receives those at boot.

## Asking for a device

A driver asks devmgr for a device by **compatible string**, not by address. It sends up to eight candidates, in order of preference:

```c
const char *want[] = { "arm,pl011", "brcm,bcm2835-aux-uart" };
uint32_t which;
Handle dev = DevmRequestDevice(devmgr_port, want, 2, &which);
```

devmgr checks each device's compatible string against the candidates, in order. For the first match it grants the caller a handle to that device capability and replies with the handle and the index of the string that matched. If nothing matches the reply is `ERR_NOENT`; a request with zero or too many strings is `ERR_BADARG`.

With the handle, the driver can query the device (`DeviceQuery`) for its interrupt and metadata, map its registers with `MemMap` (as device memory), and bind its interrupt with `IrqBind`. Without a handle the driver cannot touch the hardware.

## Behavior

- devmgr grants to the sender of the request. The kernel attests the sender's PID, so a driver cannot ask on behalf of another.
- The request travels in the long-message buffer: a command word, the string count, then the NUL-terminated strings.
- Reply words: `w1` status (`ZUZU_OK` or negative), `w2` the granted handle, `w3` the matched index.
- devmgr finds itself in the nametable as `/svc/devmgr`.

## Why a manager

Hardware authority lives in one small process rather than in each driver. A compromised driver can only reach the device devmgr gave it, and a driver cannot learn what other devices exist.
