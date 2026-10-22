---
layout: page
title: netd
section: zuzuOS
prowl:
  - {title: "netd", url: "/zuzu-docs/2.x/os/netd/"}
---

`netd` is the network stack, entirely in userspace. It talks to a NIC driver on one side and to applications on the other.

## Layers

| Layer | What |
|---|---|
| Driver (`lan9118drv`) | sends and receives Ethernet frames through shared-memory rings; registered as `/dev/eth0` |
| Link | Ethernet, ARP |
| Network | IPv4, ICMP (echo) |
| Transport | UDP, TCP |
| Application | DHCP client, DNS resolver |

## Driver interface

netd attaches to `/dev/eth0` over the `NIC_CMD_*` protocol: it asks for the MAC address and for one shared-memory region holding a receive ring and a transmit ring. The driver writes received frames into the receive ring and signals a notification (the receive doorbell); netd writes frames to transmit and rings the transmit doorbell. `NIC_CMD_STATS` returns counters such as received packets, dropped frames and ring-full events, which tools can print.

## TCP

netd implements the TCP state machine with retransmission driven by an RFC 6298 estimator (smoothed RTT with Karn's algorithm), out-of-order segment reassembly, and passive and active open. Protocol control blocks are a fixed table. Missing at this version are TCP options (SACK, window scaling) and congestion control; those are planned for later zuzuOS releases.

## Configuration

netd comes up with no address. The DHCP client runs the DISCOVER/OFFER/REQUEST/ACK exchange, and once bound it logs `network up:` with the address, gateway and DNS server. Services that depend on the network wait for that line.

## Applications

The socket protocol (`SOCKETD_CREATE`, `BIND`, `LISTEN`, `ACCEPT`, `CONNECT`, `SEND`, `RECV`, `CLOSE`) and `NETD_SEND` / `NETD_GET_IP` are defined in `include/zuzu/protocols/`, but netd in 0.7 does not serve them yet. The stack runs its own listeners and tests internally (a UDP echo handler, a DNS lookup, a TCP listener) and applications cannot open sockets. A socket API arrives in a later zuzuOS.

## Limits

- One NIC (`/dev/eth0`).
- IPv4 only; no fragmentation.
- The stack is single-threaded; one slow handler delays the whole stack.
