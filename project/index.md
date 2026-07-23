---
layout: page
title: Project
section: Project
---

<div class="section-index">
{% assign group = site.data.nav.sections | where: "section", "Project" | first %}
<ul>
{% for item in group.items %}
<li><a href="{{ item.url | relative_url }}">{{ item.title }}</a></li>
{% endfor %}
</ul>
</div>
