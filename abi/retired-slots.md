---
layout: page
title: Retired slots
section: ABI
---

These syscalls are retired and no longer supported (as of v1.0 Loaf). They are
documented here for historical reference only.

Retired numbers are never reused. A binary built against an older kernel that
invokes one of these will receive `ERR_NOSYS` rather than reaching whatever
occupies a neighbouring slot.

<div class="table-wrap">
<table>
<thead>
<tr>
<th>Number</th>
<th>Name</th>
<th>Function</th>
<th>Reason for removal</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>0x02</code></td>
<td><code>log</code></td>
<td>Print a string through the kernel.</td>
<td>Unsafe. Could have stayed as a debug-only syscall, but that complicates the ABI for something userspace already does through the tty.</td>
</tr>
<tr>
<td><code>0x33</code></td>
<td><code>shm_attach</code></td>
<td>Map a shared memory handle.</td>
<td>Fused into <code>MemMap</code>.</td>
</tr>
<tr>
<td><code>0x34</code></td>
<td><code>mapdev</code></td>
<td>Map a device MMIO region from its device capability.</td>
<td>Fused into <code>MemMap</code>.</td>
</tr>
<tr>
<td><code>0x35</code></td>
<td><code>shm_detach</code></td>
<td>Unmap a shared memory object.</td>
<td>Fused into <code>MemUnmap</code>.</td>
</tr>
<tr>
<td><code>0x36</code></td>
<td><code>querydev</code></td>
<td>Query a device capability's compatible string and IRQ.</td>
<td>Moved to <code>DevQuery</code>.</td>
</tr>
<tr>
<td><code>0x40</code></td>
<td><code>irq_claim</code></td>
<td>Bind a device's IRQ to a notification object.</td>
<td>Fused into <code>IrqBind</code> for simplicity.</td>
</tr>
</tbody>
</table>
</div>
