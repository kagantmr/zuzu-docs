---
layout: page
title: Writing a driver
section: SDK
prowl:
  - {title: "Writing a driver", url: "/zuzu-docs/2.x/guides/driver/"}
---

**Warning:** Writing a driver requires technical information about both the peripheral you are writing a driver for and the driver surface of zuzuOS.

# Writing a driver

Drivers in zuzuOS are ordinary userspace processes. They must ask [the device manager](../../os/devmgr/) for a device capability, map the peripheral's MMIO region into their own address space, bind a [notification](../../kernel/notifications/) to the peripheral's IRQ line, and expose a service via [IPC](../../kernel/ipc/). Everything a driver does is done through syscalls anyone else could call, driver code is only privileged in that devmgr has granted it a specific device capability.

This page describes the anatomy of a driver. It uses `pl011drv` (the PL011 UART driver) as the running example because it exercises every part of the driver surface. Drivers with different shapes (polled-only, IRQ-less or DMA-heavy) deviate from this template in obvious ways, called out inline.

## Prerequisites

Before writing a driver, you should be comfortable with:

- The [device manager](../../os/devmgr/): what a device capability is and where it comes from.
- [Notifications](../../kernel/notifications/): the primitive drivers use to receive IRQs.
- [IPC](../../kernel/ipc/): the primitive drivers use to expose their service.
- [Handles](../../kernel/handles/): the general concept.
- The [platform HAL page](../../platform/hal/): if you're porting a driver to a new board.

You should also have the datasheet for the peripheral open while writing the driver, as you will need to know the register layout, IRQ line, and any quirks of the hardware.

## The five phases

A driver goes through five distinct phases at startup, then enters a steady-state event loop. Every driver has all five — they may be trivial (a polled sensor has no IRQ bind), but the structure is the same.

1. **Register a service port.** So clients can find the driver via the name table.
2. **Locate devmgr.** So the driver can request its device.
3. **Request the device.** Get a device capability.
4. **Bind the IRQ.** Attach an notification to the device's interrupt line.
5. **Map MMIO and initialise the peripheral.** Configure registers into the state the driver expects.

Then the driver loops: wait for either an IRQ or a client IPC, handle whichever fired, repeat.

## Phase 1: Register a service

```c
client_port = ZuzuPortCreate();
if (client_port < 0)
    return client_port;

Err rc = RegisterService("/dev/uart0", client_port);
if (rc < 0)
    return rc;
```

The driver creates a port and registers it under a well-known name in the [name table](../../os/nametable/). Clients discover the driver by calling `LookupService("/dev/uart0")`.

Names should try to follow the `/dev/<class><instance>` convention for hardware devices, or `/svc/<name>` for service processes. Choose an instance number that reflects the physical device (e.g. `uart0`, `uart1` if the board has two UARTs), not a driver-internal counter.

## Phase 2: Locate devmgr

```c
static void wait_for_devmgr(void)
{
    while (1) {
        Handle ntmsg = LookupService("/svc/devmgr");
        if (ntmsg > 0) {
            devmgr_port = ntmsg;
            return;
        }
        ZuzuSleep(10);
    }
}
```

devmgr is a separately-loaded process, and there is no ordering guarantee between it and drivers at boot. Drivers must poll the name table until devmgr appears rather than assume it is already there. The 10 ms sleep between attempts is a common default: long enough not to burn cycles, short enough not to noticeably delay boot.

Do not proceed past this phase until devmgr is reachable. Every subsequent phase depends on it.

## Phase 3: Request the device

```c
static const char *const compat[] = {
    "arm,pl011",
    "arm,pl011-axi",   /* rpi4 lists this first */
};
Handle dev_handle = DevmRequestDevice(devmgr_port, compat, 2, NULL);
```

The driver asks devmgr for a device matching one of the compatible strings. devmgr looks up the DTB, finds a matching entry, and returns a device capability which is just a handle that grants the right to map that device's MMIO region and bind its IRQ.

**Compatible-string caveat:** the kernel's DTB enumeration keeps only the first `compatible` string per node. Different boards may list the same peripheral under different first-strings. For example, the Raspberry Pi 4 lists its PL011 as `"arm,pl011-axi"`, not the more common `"arm,pl011"`. A driver that only tries one string will silently fail on some boards. Always pass an alias list covering every board you support.

**IRQ-less drivers stop here for hardware access.** A polled sensor still needs the device cap to map MMIO, but it will not call `ZuzuIrqBind` in the next phase.

## Phase 4: Bind the IRQ

```c
serial_irq_ntfn = ZuzuNtfnCreate();
if (serial_irq_ntfn < 0)
    return serial_irq_ntfn;

int32_t bind_rc = ZuzuIrqBind(dev_handle, (uint32_t)serial_irq_ntfn);
if (bind_rc < 0)
    return bind_rc;
```

The driver creates a notification object and binds it to the device's IRQ line via the device capability. From this point on, every time the peripheral asserts its interrupt, the kernel signals the notification. The driver receives IRQs by waiting on the notification, either directly (`ZuzuNtfnWait`) or as part of a `ZuzuWaitany` handle list.

The IRQ line stays masked until the driver calls `ZuzuIrqDone(dev_handle)`. This means one IRQ triggers exactly one ntfn signal; the driver must acknowledge before another IRQ can arrive. Failing to acknowledge stalls the peripheral, not the driver.

## Phase 5: Map MMIO and initialise

```c
uart = (volatile pl011_t *)ZuzuMemMap(dev_handle, 0, PROT_RW, 0);

uart->IMSC = 0;                              /* mask all interrupts */
uart->CR = 0;                                /* disable UART */
uart->ICR = ICR_ALL;                         /* clear all pending IRQs */
uart->IFLS = (uart->IFLS & ~IFLS_RX_MASK) | IFLS_RX_1_8;
uart->LCRH = LCRH_FEN | LCRH_WLEN_8;
uart->CR = CR_UARTEN | CR_TXE | CR_RXE;      /* enable */
uart->ICR = ICR_ALL;                         /* clear again after enable */
uart->IMSC = (IMSC_RXIM | IMSC_RTIM);        /* unmask RX and RX-timeout */
```

`ZuzuMemMap` on a device handle maps the peripheral's MMIO region into the driver's address space. The returned pointer is a virtual address; access it through a `volatile` struct that mirrors the register layout.

**Always volatile.** MMIO reads and writes must not be reordered or elided by the compiler. The register struct declaration in your driver's header should be `volatile`, or every access site must cast to `volatile`. Missing this is one of the most common driver bugs and it will not fail immediately — it will fail intermittently under optimization.

**Initialise before unmasking.** Configure every register (control, line control, FIFO thresholds, whatever your peripheral needs) *before* enabling interrupts. Otherwise an IRQ can fire against a half-configured device and produce garbage.

**Reset order for interrupt-capable peripherals:**

1. Mask all IRQs in the peripheral (`IMSC = 0`).
2. Configure the peripheral.
3. Clear pending IRQs (`ICR = ICR_ALL`).
4. Unmask only the IRQs the driver wants to receive.

This sequence guarantees no stale IRQ can arrive at the driver before its handler is ready.

## Phase 6: Event loop

```c
enum { H_IRQ = 0, H_PORT = 1 };
Handle handles[] = {
    [H_IRQ]  = serial_irq_ntfn,
    [H_PORT] = client_port,
};

while (1) {
    WaitanyResult r;
    if (ZuzuWaitany(handles, 2, TIMEOUT_INFINITE, &r) != 0)
        continue;

    switch (r.kind) {
    case WAITANY_KIND_NTFN:  handle_irq_event();                     break;
    case WAITANY_KIND_SEND:  handle_write(r.w1);                     break;
    case WAITANY_KIND_CALL:  handle_read((Handle)r.source, r.w2);    break;
    }
}
```

A driver has two independent event sources: the IRQ ntfn and the client port. `ZuzuWaitany` blocks until either fires and reports which. The driver dispatches on `r.kind`. Never poll one and then the other. Blocking on the IRQ alone stalls clients; blocking on the port alone loses IRQs. `ZuzuWaitany` is the correct primitive.

**IPC kinds a driver typically handles:**

- **`WAITANY_KIND_SEND`**: a client sent a message expecting no reply. Used for writes ("send these bytes").
- **`WAITANY_KIND_CALL`**: a client sent a message expecting a reply. Used for reads ("give me some bytes back"). The driver must eventually `ChannelReply` to unblock the caller.
- **`WAITANY_KIND_NTFN`**: the driver's own notification fired. In this pattern, that means the IRQ.

## Handling an IRQ

```c
static void handle_irq_event(void)
{
    if (uart->MIS & (IMSC_RXIM | IMSC_RTIM)) {
        drain_uart_rx_fifo();
        uart->ICR = (IMSC_RXIM | IMSC_RTIM);
    }
    if (uart->MIS & IMSC_TXIM) {
        /* ... drain TX ring into hardware ... */
        uart->ICR = IMSC_TXIM;
    }
    ZuzuIrqDone((uint32_t)serial_dev_handle);
}
```

An IRQ handler in userspace looks much like one in kernel space, with one crucial difference: the last step is `ZuzuIrqDone(dev_handle)`. This tells the kernel "I've serviced this interrupt, please unmask it." Without it, the IRQ line stays masked forever and no further interrupts arrive.

Read the masked interrupt status register (`MIS` on PL011) to see which cause fired. A single notification signal may correspond to multiple concurrent causes, and your driver must handle each one before returning. Clear the peripheral's pending bits (`ICR` on PL011) for each cause you handled. This is peripheral-level acknowledgement, distinct from `ZuzuIrqDone` which is kernel-level.

## Serving client requests

Write path (fire-and-forget):

```c
static void handle_write(uint32_t len)
{
    if (len > LMSG_BUF_SIZE)
        len = LMSG_BUF_SIZE;

    const char *buf = LmsgBuf();
    for (uint32_t i = 0; i < len; i++)
        uart_txbyte(buf[i]);
}
```

Read path (reply expected):

```c
static void handle_read(Handle reply_handle, uint32_t max_len)
{
    if (max_len > LMSG_BUF_SIZE)
        max_len = LMSG_BUF_SIZE;

    drain_uart_rx_fifo();

    char *buf = (char *)LmsgBuf();
    uint32_t n = 0;
    while (n < max_len && ring_avail(&rxrb) > 0) {
        uint8_t b;
        if (ring_pop(&rxrb, &b) != 0) break;
        buf[n++] = (char)b;
    }

    ChannelReply(reply_handle, buf, n);
}
```

Every driver eventually settles on a small verb set: read, write, `ioctl`-equivalent. The verbs travel in the message header; payload travels in the [lmsg buffer](../../kernel/ipc/#lmsg). Keep the protocol under `zuzu/protocols/<class>.h` so clients and drivers share the same definitions.

Do not block inside a request handler waiting for hardware. If a client asks for more bytes than the driver has buffered, reply with what's available and let the client call again. The driver's own event loop is what wakes clients when new data arrives, you should never invert this by blocking inside the handler and starving IRQ dispatch.

## Buffering

Drivers that mediate between an interrupt source and a client (any I/O driver, essentially) need ring buffers. Data arriving from hardware goes into an RX ring; the client drains it via IPC. Data from the client goes into a TX ring; the driver drains it into hardware, refilling when the peripheral signals TX-empty via IRQ.

The `ring_t` primitive in `<ring.h>` is a simple SPSC ring. Size it based on the peripheral's throughput and the expected client latency, a UART at 115200 baud fills 1 KB in about 70 ms, so a 4 KB ring gives clients hundreds of milliseconds to catch up. Networking peripherals will want much larger.

## What to put where

A typical driver's file layout:

```
user/drivers/<name>drv/
    main.c              — the driver process itself
    <name>drv.h         — internal constants, register layout struct
    Makefile            — build integration
```

Register layouts, bit definitions, and IRQ line numbers go in the driver's header. Nothing outside the driver process needs them. The client-facing IPC protocol goes in `zuzu/protocols/<class>.h` (e.g. `uart.h`, `net.h`). Both the driver and any client program include this header, so verb IDs and payload structs stay in sync.

## Boot integration

Adding a driver to the initial boot manifest so sysd starts it:

1. Add the driver binary to the initrd build.
2. Add an entry to `boot.manifest`:

```
user/drivers/<name>drv/<name>drv.zxf
```

3. On boot, sysd reads the manifest and spawns each entry as a process. Order does not matter since drivers wait for devmgr via the name table poll in Phase 2.

## Variations from the pl011drv template

**Polled-only driver (no IRQ):** skip Phase 4. In the event loop, use `ZuzuWaitany` on just the client port. Read from hardware inside the request handler, but keep the handler fast (no busy-waiting).

**IRQ-only driver (no client-facing IPC):** skip Phase 1. The driver runs its own logic in response to IRQs and typically communicates via shared memory or by driving another service. Rare in practice; most peripherals are ultimately serving some client.

**DMA-heavy driver:** currently unsupported, but the same principles apply. The driver must still request the device, bind the IRQ, and map MMIO. The event loop may be more complex, with multiple notifications for DMA completion.

**Multi-instance driver:** register multiple service names (`/dev/uart0`, `/dev/uart1`), request multiple device caps by compatible string with different DTB unit addresses. The event loop groups all IRQs from all instances into a single `ZuzuWaitany`.

## Common pitfalls

- **Forgetting `volatile` on register access.** Works in debug builds, breaks under `-O2`.
- **Forgetting `ZuzuIrqDone`.** First IRQ works, no subsequent ones arrive.
- **Unmasking IRQs before configuring the peripheral.** Random early garbage; hard to debug.
- **Trying only one `compatible` string.** Works on one board, silently fails on others.
- **Blocking inside a request handler.** Drops IRQs, hangs the driver.
- **Assuming devmgr is ready at startup.** Race with sysd's spawn order; always poll.
- **Sizing rings too small.** Data loss under load, especially on RX where you can't apply backpressure to hardware.