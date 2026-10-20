/* Tiny window manager: open/close/focus, drag by title bar (mouse + touch
   via Pointer Events), stacked layout on small screens. No dependencies. */
(() => {
  'use strict';
  const desk = document.getElementById('desktop');
  const wins = [...desk.querySelectorAll('.window')];
  const wide = matchMedia('(min-width: 769px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let z = 10;
  let lastOpener = null;

  const isWide = () => wide.matches;

  function activate(win) {
    wins.forEach(w => w.classList.toggle('is-active', w === win));
    if (isWide()) win.style.zIndex = ++z;
    document.querySelectorAll('.icon').forEach(i =>
      i.classList.toggle('is-selected', i.dataset.open === win.id));
  }

  function place(win) {
    if (!isWide()) { win.style.left = win.style.top = win.style.width = win.style.zIndex = ''; return; }
    const dw = desk.clientWidth, dh = desk.clientHeight;
    const w = Math.min(+win.dataset.w || 380, dw - 140);
    win.style.width = w + 'px';
    const x = Math.max(120, Math.min(+win.dataset.x || 140, dw - w - 12));
    const y = Math.max(10, Math.min(+win.dataset.y || 20, dh - 120));
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  }

  // show a window without moving focus (used by terminal.js)
  function show(win) {
    win.hidden = false;
    place(win);
    if (isWide() && !reduce.matches) {
      win.classList.remove('opening'); void win.offsetWidth; win.classList.add('opening');
    }
    win.style.zIndex = isWide() ? ++z : '';
  }
  window.Desk = { show };

  function open(id, opener) {
    const win = document.getElementById(id);
    if (!win) return;
    const wasHidden = win.hidden;
    win.hidden = false;
    if (wasHidden && isWide() && !reduce.matches) {
      win.classList.remove('opening'); void win.offsetWidth; win.classList.add('opening');
    }
    activate(win);
    lastOpener = opener || null;
    const h = win.querySelector('h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: isWide() });
    if (!isWide()) win.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
    document.dispatchEvent(new CustomEvent('desk:open', { detail: { id } }));
  }

  function close(win) {
    win.hidden = true;
    win.classList.remove('is-active');
    document.querySelectorAll(`.icon[data-open="${win.id}"]`).forEach(i => i.classList.remove('is-selected'));
    const back = lastOpener || document.querySelector(`.icon[data-open="${win.id}"]`);
    if (back) back.focus();
    document.dispatchEvent(new CustomEvent('desk:close', { detail: { id: win.id } }));
  }

  // initial state
  wins.forEach(win => {
    const closed = isWide() ? win.hasAttribute('data-closed') : win.hasAttribute('data-closed-mobile');
    win.hidden = closed;
    place(win);
  });
  const first = wins.filter(w => !w.hidden).pop();
  if (first) activate(first);

  // openers (icons + menu); links keep working without JS
  document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); open(el.dataset.open, el); });
  });

  wins.forEach(win => {
    win.querySelector('.close').addEventListener('click', () => close(win));
    win.querySelector('.zoom').addEventListener('click', () => activate(win));
    win.addEventListener('pointerdown', () => activate(win));
    win.addEventListener('focusin', () => activate(win));
    win.addEventListener('keydown', e => { if (e.key === 'Escape') close(win); });

    // dragging
    const bar = win.querySelector('.titlebar');
    bar.addEventListener('pointerdown', e => {
      if (!isWide() || e.button !== 0 || e.target.closest('button')) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY;
      const ox = win.offsetLeft, oy = win.offsetTop;
      const maxX = desk.clientWidth - 60, maxY = desk.clientHeight - 30;
      bar.setPointerCapture(e.pointerId);
      win.classList.add('is-dragging');
      const move = ev => {
        win.style.left = Math.min(maxX, Math.max(-win.offsetWidth + 80, ox + ev.clientX - sx)) + 'px';
        win.style.top = Math.min(maxY, Math.max(0, oy + ev.clientY - sy)) + 'px';
      };
      const up = () => {
        win.classList.remove('is-dragging');
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });

    // keyboard move: focus the title, then Alt+Arrow keys
    win.querySelector('h2').addEventListener('keydown', e => {
      if (!isWide() || !e.altKey) return;
      const d = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key];
      if (!d) return;
      e.preventDefault();
      win.style.left = win.offsetLeft + d[0] + 'px';
      win.style.top = Math.max(0, win.offsetTop + d[1]) + 'px';
    });
  });

  wide.addEventListener('change', () => wins.forEach(place));

  // menu-bar clock (Mexico City time)
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 30000);
})();
