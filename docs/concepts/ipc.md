# IPC

!!! abstract "To write"
    Ports, synchronous calls and replies.

## Call and reply

- the message box, xlen, MSG_BUF_SIZE
- ReplyRecv as the server loop

## Priority inheritance

- a server runs at its caller's priority while serving

## Parking a call

- Hold() and ReplyTo(): tickets, worker pools, what happens when a side dies
