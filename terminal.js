/* Simulated Maigret run. Opens with About/Contact, types the command and
   prints only the entries from data/maigret-hits.js. No network calls. */
(() => {
  'use strict';
  const win = document.getElementById('win-term');
  const out = document.getElementById('term-out');
  const skip = document.getElementById('term-skip');
  const data = window.MAIGRET_HITS;
  if (!win || !out || !data || !window.Desk) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [], running = false;

  const line = (text, cls) => {
    const el = document.createElement('div');
    if (cls) el.className = cls;
    el.textContent = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    return el;
  };
  const hit = h => {
    const el = line('[+] ' + h.site + ': ', 'ok');
    const a = document.createElement('a');
    a.href = h.url; a.textContent = h.url; a.target = '_blank'; a.rel = 'noopener';
    el.appendChild(a);
  };

  // Output format copied from Maigret's CLI (notify.py / maigret.py / report.py)
  const BAR = matchMedia('(max-width: 768px)').matches ? 10 : 24;
  const bar = (done, n, secs) => {
    const k = Math.round(BAR * done / n);
    return 'Searching |' + '\u2588'.repeat(k) + ' '.repeat(BAR - k) + '| ' + done + '/' + n +
      ' [' + Math.round(100 * done / n) + '%] in ' + secs.toFixed(1) + 's (' + (done / Math.max(secs, .1)).toFixed(1) + '/s)';
  };

  function steps() {
    const u = data.username, n = data.sitesChecked, hits = data.hits || [];
    const s = [];
    let pb = null;
    s.push({ type: true, text: 'maigret ' + u });
    s.push({ t: 300, f: () => line('[-] Starting a search on top ' + n + ' sites from the Maigret database...') });
    s.push({ t: 150, f: () => line('[!] You can run search by full list of sites with flag `-a`') });
    s.push({ t: 250, f: () => line('[*] Checking username ' + u + ' on:', 'info') });
    const total = 9.6, frames = 12;
    for (let i = 1; i <= frames; i++) {
      const done = Math.round(n * i / frames), secs = total * i / frames;
      const h = hits[Math.floor((i - 1) * hits.length / frames)];
      const showHit = h && Math.floor((i - 1) * hits.length / frames) !== Math.floor((i - 2) * hits.length / frames);
      s.push({ t: 260, f: () => {
        if (showHit) { if (pb) pb.remove(); hit(h); pb = null; }
        if (!pb) pb = line('', 'bar');
        pb.textContent = bar(done, n, secs);
      } });
    }
    s.push({ t: 300, f: () => line('[*] Short text report:', 'info') });
    s.push({ t: 100, f: () => line('Search by username ' + u + ' returned ' + hits.length + ' accounts.', 'sum') });
    s.push({ t: 100, f: done });
    return s;
  }

  function prompt() { return line('$ ', 'cmd'); }

  function done() {
    running = false;
    prompt().classList.add('cursor');
    skip.hidden = true;
  }

  function finishNow() {
    timers.forEach(clearTimeout); timers = [];
    out.textContent = '';
    steps().forEach(st => st.type ? (prompt().textContent += st.text) : st.f());
  }

  function play() {
    timers.forEach(clearTimeout); timers = [];
    out.textContent = '';
    skip.hidden = false;
    running = true;
    if (reduce.matches) { finishNow(); return; }
    let at = 0;
    steps().forEach(st => {
      if (st.type) {
        const p = prompt();
        [...st.text].forEach(ch => { at += 70; timers.push(setTimeout(() => { p.textContent += ch; }, at)); });
        at += 250;
      } else {
        at += st.t; timers.push(setTimeout(st.f, at));
      }
    });
  }

  skip.addEventListener('click', () => { if (running) finishNow(); });

  document.addEventListener('desk:open', e => {
    const id = e.detail.id;
    if (id !== 'win-about' && id !== 'win-contact') return;
    if (!win.hidden) return;           // already showing: don't restart
    Desk.show(win);                    // open without stealing focus
    play();
  });
  document.addEventListener('desk:close', e => {
    if (e.detail.id === 'win-term') { timers.forEach(clearTimeout); timers = []; running = false; }
  });
})();
