---
name: GetPid
number: "0x04"
group: task
since: "1.0"
blocking: no
signature: "() -> pid"
returns: "PID of the process."
prowl:
  - {title: "Spaces and tasks", url: "/zuzu-docs/2.x/concepts/spaces-tasks/"}
  - {title: "HandleQueryAt", url: "/zuzu-docs/2.x/reference/syscalls/handlequeryat/"}
prowl_note: "Processes are split into spaces and tasks, and there is no PID; identity is a handle or marker."
---

Get the PID of the current process.
