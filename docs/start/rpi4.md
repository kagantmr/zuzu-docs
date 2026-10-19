# Run on a Raspberry Pi 4

!!! abstract "To write"
    Flashing an SD card and booting on real hardware. The Pi 4 cannot be emulated (AArch32 + raspi4b is a QEMU gap).

## Prepare the card

- `make rpi4-firmware`, `make BOARD=rpi4`, card layout

## Serial console

- UART pins, baud rate, what a good boot looks like
