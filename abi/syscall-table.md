---
layout: page
title: Syscall table
section: ABI
---

The syscall number is the `SVC` immediate; arguments pass in `r0–r3` and the result returns in `r0`, with negative values meaning error (see [Syscall ABI]({{ '/abi/syscall-abi/' | relative_url }}) for the convention and [error codes]({{ '/abi/error-codes/' | relative_url }}) for the full list). Every kernel object -port, notification, shared-memory region, device, task- is named by a **handle**, a small per-process slot index; userspace never holds a raw kernel pointer.

<div class="note">This table reflects the <strong>Loaf</strong> freeze (kernel 1.0) plus compatible 1.x additions such as <code>stamp</code>. The numbers and signatures below are stable: a number is never renumbered or reused, and retired calls leave their slots permanently reserved rather than recycling them.</div>

## The table

<div class="syscall-groups">
{% assign order = "misc,handle,task,space,memory,ipc,event" | split: "," %}
{% for key in order %}
{% assign all = site.syscalls | where: "group", key %}
{% assign calls = all | where_exp: "s", "s.helper != true" | sort: "number" %}
{% assign helpers = all | where: "helper", true | sort: "name" %}
{% assign items = calls | concat: helpers %}
<h3>{% case key %}{% when "misc" %}Basics{% when "handle" %}Handles{% when "task" %}Tasks{% when "space" %}Spaces{% when "memory" %}Memory and DMA{% when "ipc" %}IPC{% when "event" %}Events{% endcase %}</h3>
<div class="table-wrap">
<table>
<thead><tr><th>Number</th><th>Name</th><th>Selector</th><th>Summary</th></tr></thead>
<tbody>
{% for sc in items %}<tr><td>{% if sc.helper %}helper{% else %}<code>{{ sc.number }}</code>{% endif %}</td><td><a href="{{ sc.url | relative_url }}"><code>{{ sc.name }}</code></a></td><td>{% if sc.selector %}<code>{{ sc.selector }}</code>{% endif %}</td><td>{{ sc.summary | markdownify | remove: '<p>' | remove: '</p>' }}</td></tr>
{% endfor %}</tbody>
</table>
</div>
{% endfor %}
</div>
