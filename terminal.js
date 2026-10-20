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

  function steps() {
    const u = data.username, n = data.sitesChecked, hits = data.hits || [];
    const s = [];
    s.push({ type: true, text: 'maigret ' + u });
    s.push({ t: 250, f: () => line('Maigret: username OSINT across sites', 'dim') });
    s.push({ t: 200, f: () => line('(simulated run, links are public profiles)', 'dim') });
    s.push({ t: 300, f: () => line('[*] Checking username ' + u + ' on ' + n + ' sites...') });
    const pct = [25, 50, 75, 100];
    hits.forEach((h, i) => {
      if (pct[i] && i < hits.length - 1) s.push({ t: 350, f: () => line('[*] ' + pct[i] + '% done...', 'dim') });
      s.push({ t: 450, f: () => hit(h) });
    });
    s.push({ t: 400, f: () => line('[*] 100% done.', 'dim') });
    s.push({ t: 300, f: () => line('[*] Search finished. ' + hits.length + ' accounts found for ' + u + '.', 'sum') });
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
