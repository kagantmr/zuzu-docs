---
layout: page
title: Name table
section: zuzuOS
prowl:
  - {title: "Names", url: "/zuzu-docs/2.x/os/names/"}
---

The name table is the registry of services. It is run by its own process, the `nameserver`, which sysd starts first. Slot 0 of every process's handle table is a handle to the nameserver's port (`NT_PORT`).

## Names

A name is a **path** of at most 63 characters, such as `/svc/fsd`, `/dev/uart0` or `/env/zzsh`. By convention drivers live under `/dev`, services under `/svc` and user-facing programs under `/env`. The table holds 512 entries.

## Registering

A server creates a port and registers it:

```c
Handle port = ZuzuPortCreate();
Err rc = RegisterService("/svc/fsd", port);
```

Under the hood this is an `NT_REGISTER` message in the long-message buffer (command, handle slot, then the path) with the port granted to the nameserver.

Rules:

- The caller must have a **label**. A process with no label gets `ERR_NOPERM`.
- The first label to register a path **owns** it. Another process with a different label registering the same path gets `ERR_BUSY`. The owner can register it again to replace its own handle, which is how a restarted service takes its name back.
- A full table gives `ERR_NOMEM`.

Because labels are set by `sysd` from the manifest, a path can only be owned by the program the manifest assigned it to. A program cannot take over `/svc/fsd` just by registering first.

## Looking up

```c
Handle h = LookupService("/svc/fsd");        // handle in the caller's table, or negative
```

`NT_LOOKUP` finds the path and **grants a handle to the caller**. The reply carries the status, the new handle slot, and the PID of the process that registered it. A client can compare that PID with the sender of later messages and ignore anyone else. Lookup of an unknown path is `ERR_NOENT`; an entry whose process is gone is removed and reports `ERR_DEAD`.

Two further operations exist for sysd: `NT_LOOKUP_PID` (find a service by PID, used for console aliasing) and `NT_SCRUB_PID` (remove every entry of a dead process; refused for anyone but sysd).

## Limits

- No listing and no wildcard: lookup is by exact path.
- Entries are removed only when sysd scrubs a dead process or a lookup finds the port dead.
- Lookup does not check who is asking; anyone can find any service.
