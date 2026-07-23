---
layout: page
title: Syscall table
section: ABI
---

The syscall number is the `SVC` immediate; arguments pass in `r0–r3` and the result returns in `r0`, with negative values meaning error (see [Syscall ABI]({{ '/abi/syscall-abi/' | relative_url }}) for the convention and [error codes]({{ '/abi/error-codes/' | relative_url }}) for the full list). Every kernel object -port, notification, shared-memory region, device, task- is named by a **handle**, a small per-process slot index; userspace never holds a raw kernel pointer.

<div class="note">This table reflects the <strong>Loaf</strong> freeze (kernel 1.0). The numbers and signatures below are stable: a number is never renumbered or reused, and retired calls leave their slots permanently reserved rather than recycling them.</div>

## The table

<div class="syscall-groups">
{% assign order = "task,messaging,handles,memory,irq" | split: "," %}
{% for key in order %}
{% assign items = site.syscalls | where: "group", key | sort: "number" %}
<h3>{% case key %}{% when "task" %}Task lifecycle (0x00–0x0B){% when "messaging" %}Messaging (0x10–0x17){% when "handles" %}Handles &amp; capabilities (0x20–0x26){% when "memory" %}Memory (0x30–0x38){% when "irq" %}Interrupts (0x40–0x42){% endcase %}</h3>
<div class="table-wrap">
<table>
<thead><tr><th>Number</th><th>Name</th><th>Signature</th></tr></thead>
<tbody>
{% for sc in items %}<tr><td><code>{{ sc.number }}</code></td><td><a href="{{ sc.url | relative_url }}"><code>{{ sc.name }}</code></a></td><td><code>{{ sc.signature }}</code></td></tr>
{% endfor %}</tbody>
</table>
</div>
{% endfor %}
</div>
