# Your first program

## The program

zuzuOS has enough infrastructure to let you write a simple "Hello world!" program and run it. zlibc has implemented a substantial amount of libc calls, so `printf` will do things like IPC for you. crt0.S in `arch/` will hand you the argv, argc and run C constructors/destructors for you. C++ support is currently minimal, however it will be introduced in a later zuzuOS version, as well as possibly Rust.

Write your program under a folder in `user/*/`, such as `user/test_apps/program`:
```c

#include <stdio.h>
#include <types.h>

int main() {
    printf("Hello, zuzu!\n");
    return ZUZU_OK;
} 
```

## Building it

After you have written your program, you must either compile it by yourself by linking it to zuzu headers OR you can link it into the automatic build system by putting the program's name in `sd.manifest`, or `boot.manifest` if you want it to run in-memory (not preferred). Then build the SD card image as you normally would.

## Running it

Type the name or path of your program on zzsh and show the kernel report the output of `SvcQuit`, which means the program successfully invoked a request to exit. It will report the error status of the exiting program with the message, which tells if there was any errors.