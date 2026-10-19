# Concepts

!!! abstract "To write"
    How zuzu works, one idea per page. Read in order the first time.

## The model in one picture

- five objects: Space, Task, Port, Event, Memory
- everything is reached through a handle; holding the handle is the permission
- a non-preemptive kernel under one big lock, everything else in userspace
