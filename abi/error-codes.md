---
layout: page
title: System call returns
section: ABI
---

If an error occurs during service, the server (whatever process or kernel function that may be) will return a negative value in `r0`.
You can use this table
to deduce which error was returned.

## Kernel codes

These codes are part of the syscall contract: the number and its meaning never change, and no
code is ever removed or renumbered. New kernel codes may only be added in the reserved
`-13`…`-99` band.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Value</th>
<th>Name</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>0</code></td>
<td><code>ZUZU_OK</code></td>
<td>Success</td>
</tr>
<tr>
<td><code>-1</code></td>
<td><code>ERR_NOPERM</code></td>
<td>Caller lacks the right for this operation</td>
</tr>
<tr>
<td><code>-2</code></td>
<td><code>ERR_NOENT</code></td>
<td>A name or id (not a handle) does not exist</td>
</tr>
<tr>
<td><code>-3</code></td>
<td><code>ERR_BUSY</code></td>
<td>Object exists but is in the wrong state or in use</td>
</tr>
<tr>
<td><code>-4</code></td>
<td><code>ERR_NOMEM</code></td>
<td>Kernel resource exhausted: PMM, kmalloc, table, VA</td>
</tr>
<tr>
<td><code>-5</code></td>
<td><code>ERR_BADTYPE</code></td>
<td>Handle exists but is the wrong type here</td>
</tr>
<tr>
<td><code>-6</code></td>
<td><code>ERR_BADARG</code></td>
<td>A passed value is invalid (flag, size, count)</td>
</tr>
<tr>
<td><code>-7</code></td>
<td><code>ERR_NOSYS</code></td>
<td>No such syscall, or no such RPC operation</td>
</tr>
<tr>
<td><code>-8</code></td>
<td><code>ERR_BADPTR</code></td>
<td>User pointer invalid, unmapped, or uncopyable</td>
</tr>
<tr>
<td><code>-9</code></td>
<td><code>ERR_DEAD</code></td>
<td>Object was destroyed, or peer is gone</td>
</tr>
<tr>
<td><code>-10</code></td>
<td><code>ERR_TIMEOUT</code></td>
<td>Deadline expired; also returned when a poll finds nothing</td>
</tr>
<tr>
<td><code>-11</code></td>
<td><code>ERR_OVERFLOW</code></td>
<td>Caller size/payload exceeds a static limit</td>
</tr>
<tr>
<td><code>-12</code></td>
<td><code>ERR_BADHANDLE</code></td>
<td>Handle index names no live entry in the table</td>
</tr>
<tr>
<td><code>-13 ... -99</code></td>
<td>-</td>
<td>Reserved for future zuzu kernel codes</td>
</tr>
</tbody>
</table>
</div>

## zuzuOS server/library codes

Codes `-100` and up belong to zuzuOS servers and libraries. They may be added to or
renumbered with the OS, but the same rule still holds: one code, one meaning.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Value</th>
<th>Name</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>-100</code></td>
<td><code>ERR_BUFFULL</code></td>
<td>Ring/channel is full (writer side)</td>
</tr>
<tr>
<td><code>-101</code></td>
<td><code>ERR_BUFEMPTY</code></td>
<td>Ring/channel is empty (reader side)</td>
</tr>
<tr>
<td><code>-102</code></td>
<td><code>ERR_SYSDOWN</code></td>
<td>A required service is not running</td>
</tr>
<tr>
<td><code>-103</code></td>
<td><code>ERR_NOTCONN</code></td>
<td>Connection/session is not established</td>
</tr>
<tr>
<td><code>-104</code></td>
<td><code>ERR_DUPLICATE</code></td>
<td>Duplicate registration/request rejected</td>
</tr>
<tr>
<td><code>-105</code></td>
<td><code>ERR_MALFORMED</code></td>
<td>Received bytes fail to parse (wire/packet)</td>
</tr>
<tr>
<td><code>-106</code></td>
<td><code>ERR_IO</code></td>
<td>Device or filesystem I/O error</td>
</tr>
<tr>
<td><code>-107</code></td>
<td><code>ERR_OUTDATED</code></td>
<td>Feature is deprecated, or there is a version mismatch between binaries</td>
</tr>
</tbody>
</table>
</div>

## Fatal error codes

Fatal codes come from critical processes and are delivered to the kernel. A fatal code is a
32-bit value: the high 16 bits carry the tag `0xFA7A`
(`FATAL_TAG = 0xFA7A0000`, matched with
`FATAL_TAG_MASK = 0xFFFF0000`) and the low 16 bits carry the reason
(`FATAL_REASON_MASK = 0x0000FFFF`). Do **not** use these
codes as process exit codes.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Reason</th>
<th>Name</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>1</code></td>
<td><code>FATAL_KERNEL_OUTDATED</code></td>
<td>The running kernel is too old for this binary</td>
</tr>
</tbody>
</table>
</div>
