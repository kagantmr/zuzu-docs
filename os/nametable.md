---
layout: page
title: Name service
section: zuzuOS
---

The **name service** `nsvc` is a task within the **root service** `rootsvc`. For tasks to send messages to services for I/O, they need to be found in a global registry that can be looked up from and registered to. `nsvc` provides this under `rootsvc`'s space.

## How to find a service

