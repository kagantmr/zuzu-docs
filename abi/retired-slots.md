---
layout: page
title: Retired slots
section: ABI
---

These syscalls are retired and no longer supported (as of v1.0 Loaf). They are documented here for historical reference only.


<div class="table-wrap">
<table>
<thead>
<tr>
<th>Number</th>
<th>Name</th>
<th>Function</th>
<th>Reason of removal</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>0x2</code></td>
<td><code>log</code></td>
<td>Print a string through the kernel.</td>
<td>Unsafe, could be a debug syscall but complicates things</td>
</tr>

<tr>
<td><code>0x33</code></td>
<td><code>shm_attach</code></td>
<td>Map a shared memory handle.</td>
<td>Fused into <code>MemMap</td>
</tr>

<tr>
<td><code>0x34</code></td>
<td><code>mapdev</code></td>
<td>Map a device MMIO from its device capability.</td>
<td>Fused into <code>MemMap</td>
</tr>

<tr>
<td><code>0x35</code></td>
<td><code>shm_detach</code></td>
<td>Unmap a shared memory object</td>
<td>Fused into <code>MemUnmap</td><td>
</tr>

<tr>
<td><code>0x36</code></td>
<td><code>querydev</code></td>
<td>Same functionality as DevQuery</td>
<td>Moved to <code>DevQuery</td><td>
</tr>

<tr>
<td><code>0x40</code></td>
<td><code>irq_claim</code></td>
<td>Bind the IRQ of a device into a notification object</td>
<td>Fused in to <code>IrqBind</td> for simplicity. <td>
</tr>

</tbody>
</table>
 </div>
