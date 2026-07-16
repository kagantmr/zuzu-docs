/* nav.js — injects the sidebar and marks the active link */
(function () {
  const nav = `
<a class="nav-logo" href="index.html">zuzu <small>the Scottish Fold microkernel</small></a>
<ul>
  <li><a href="index.html">Overview</a></li>

  <li><span class="nav-section">Kernel</span></li>
  <li><a href="architecture.html">Architecture</a></li>
  <li><a href="memory.html">Memory</a></li>
  <li><a href="processes.html">Processes &amp; threads</a></li>
  <li><a href="ipc.html">IPC</a></li>
  <li><a href="interrupts.html">Interrupts</a></li>
  <li><a href="syscall_abi.html">Syscall ABI</a></li>
  <li><a href="syscall.html">Syscall table</a></li>

  <li><span class="nav-section">Userspace</span></li>
  <li><a href="servers.html">Server processes</a></li>
  <li><a href="protocols.html">IPC protocols</a></li>
  <li><a href="zcrt.html">zuzu C Runtime (ZCRT)</a></li>

  <li><span class="nav-section">Porting</span></li>
  <li><a href="boot.html">Boot sequence</a></li>
  <li><a href="hal.html">HAL &amp; portability</a></li>
  <li><a href="debugging.html">Debugging</a></li>

  <li><span class="nav-section">Project</span></li>
  <li><a href="roadmap.html">Roadmap</a></li>
  <li><a href="versioning.html">Versioning</a></li>
  <li><a href="releases.html">Releases</a></li>
  <li><a href="contributing.html">Contributing</a></li>
  <li><a href="https://github.com/kagantmr/zuzu" target="_blank">GitHub &#8599;</a></li>
</ul>`;

  const el = document.getElementById('nav');
  if (el) {
    el.innerHTML = nav;
    const page = location.pathname.split('/').pop() || 'index.html';
    el.querySelectorAll('a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  }
})();
