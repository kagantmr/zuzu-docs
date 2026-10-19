# Objects and handles

!!! abstract "To write"
    The five objects and how handles name them.

## The five objects

- Space, Task, Port, Event, Memory: what each is for

## Handles

- index (10 bits) + generation; why a stale handle fails with ERR_BADHANDLE
- permissions: PERM_WAIT/SEND/TXFR/MAP/CNTL, restricting, duplicating

## Passing handles

- HandleGrant, granting through Call/Reply, PERM_TXFR

## Markers

- set by the port-owner space, how servers tell callers apart
