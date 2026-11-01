# Start here

# zuzu

![Boot screen](docs/img/shell_new.png)

zuzu is a education/learning microkernel written from scratch in C and ARM assembly targeting IoT devices. **zuzuOS** is the userspace that runs on top of it with drivers, services for protocol stacks, shell and other applications. Microkernels have a reputation for being too slow for practical use, mostly due to Mach. zuzu is an argument that this is no longer true for the embedded, IoT, and router-class systems.

## About

This began as a hobby project, a way to put every piece of systems programming I cared about into one place and became a master's thesis and undergraduate capstone. It is still the project I most wanted to build in my life. It is named after our family cat, Zuzu, a Scottish Fold.

## Design

The zuzu kernel revolves entirely around managing the **five types of objects** that userspace uses: Spaces, Tasks, Regions (currently Memory), Ports and Events. zuzu argues that these five objects, when designed the right way, are sufficient to describe what an IoT system will need.

## Status

zuzu is still under active development. Contributions are appreciated, please read [Contributing](../project/contributing.md)!

## Third-party components

zuzu's own code is MIT-licensed. The components below keep their own licenses.

| Component         | Location                   | License       | Upstream                                                        |
| ----------------- | -------------------------- | ------------- | --------------------------------------------------------------- |
| libfdt            | `vendor/libfdt/`           | BSD-2-Clause  | [dgibson/dtc](https://github.com/dgibson/dtc)                   |
| Kconfiglib 14.1.0 | `vendor/kconfiglib/`       | ISC           | [ulfalizer/Kconfiglib](https://github.com/ulfalizer/Kconfiglib) |
| LVGL              | `vendor/lvgl/` (submodule) | MIT           | [lvgl/lvgl](https://github.com/lvgl/lvgl)                       |
| FatFs R0.16       | `user/services/fsd/fatfs/` | FatFs license | [elm-chan.org/fsw/ff](http://elm-chan.org/fsw/ff/)              |

## Credits

- zuzu logo designed by Zoz
- zuzuFONT designed by Esther (`fbcons`)

## Next steps

- [Build and run in QEMU](qemu.md)
- [Run on a Raspberry Pi 4](rpi4.md)
- [Your first program](first-program.md)
