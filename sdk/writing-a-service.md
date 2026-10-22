---
layout: page
title: Writing a service
section: SDK
prowl:
  - {title: "Writing a service", url: "/zuzu-docs/2.x/guides/service/"}
---

A service is an ordinary process that owns a port, registers a name, and answers requests. This is how to write one for zuzuOS 0.7.

## Skeleton

```c
#include <zuzu/zuzu.h>
#include <zuzu/service.h>

#define MY_CMD_PING 1

int main(void)
{
    Handle port = ZuzuPortCreate();
    if (port < 0 || RegisterService("/svc/ping", port) != ZUZU_OK)
        return 1;

    for (;;) {
        Message m = ZuzuMsgRecv(port, TIMEOUT_INFINITE);
        Handle reply = (Handle)m.w0;     // handle to answer on
        Pid sender   = (Pid)m.w1;        // the client's PID, stamped by the kernel
        uint32_t cmd = m.w2;
        uint32_t arg = m.w3;

        if (cmd == MY_CMD_PING)
            ZuzuMsgReply(reply, ZUZU_OK, arg, 0);
        else
            ZuzuMsgReply(reply, ERR_NOSYS, 0, 0);
        (void)sender;
    }
}
```

`RegisterService` grants your port to the nameserver and registers the path. A client does `LookupService("/svc/ping")` and then `ZuzuMsgCall(h, MY_CMD_PING, 42, 0)`.

## Steps

1. **Define the protocol** in a header under `include/zuzu/protocols/`: command numbers, what each request and reply carries, and any shared-memory layout. See [IPC protocols]({{ '/os/protocols/' | relative_url }}).
2. **Add the program** under `user/services/<name>/` with a `build.mk` modeled on an existing service.
3. **Add it to the board's `boot.manifest`** (`bin/<name>|none|/svc/<name>`), or place the binary on the SD card and run it from the shell. A service started by the manifest gets a **label** from its path, and only a process with that label can register that path. A program started from the shell has no label and cannot register.
4. **Register early.** Clients can only find you after `RegisterService` returns, so do slow setup (mapping devices, allocating buffers) before it or accept that clients will have to retry.

## Serving many clients

Use **markers** to tell clients apart: create the port, `Stamp` a new handle with a marker for each client, and grant it. Receive with `Waitany` so the marker comes back with each message. This avoids a port or a thread per client.

## Bulk data

Do not push large data through messages. Let the client create a shared memory object, grant it to you, and map it, as fsd does. Validate offsets and lengths against the mapped size, and copy a request out of shared memory before acting on it.

## Talking to hardware

If your service is a driver, get its device from devmgr (`DevmRequestDevice`) rather than hard-coding addresses. See [I/O & peripherals]({{ '/platform/io/' | relative_url }}).

## Pitfalls

- Do not call sysd while sysd is waiting on you.
- A single-threaded service that blocks on another service can deadlock on a cycle. Keep the dependency graph acyclic.
- Check the owner PID returned by lookup against the sender of replies.
