# juliosuas.pages.dev

Personal site of Julio Suástegui, Security / OSINT engineer in Mexico City.
It looks like a 1980s desktop: a menu bar, icons, and windows you can drag around.

Live: https://juliosuas.pages.dev

## What's here

Static HTML, CSS and about 120 lines of vanilla JS. There's no build step.

- `index.html`: the desktop (About, Upstream work, Projects, Contact, Trash)
- `404.html`: a "System Error" dialog
- `style.css`: theme and layout
- `terminal.js`: opens with About/Contact and plays a simulated, offline Maigret run. Entries come only from `data/maigret-hits.js`
- `desktop.js`: draggable windows using Pointer Events, so mouse and touch both work. Esc closes a window.
- `fonts/`: self-hosted OFL fonts and their licenses

Wider than 768px, the windows float and you can drag them. At 768px or narrower they stack and scroll.
With JS off, every window shows, stacked. The site respects `prefers-reduced-motion` and `forced-colors`.

## Run locally

```sh
python3 -m http.server 8765
```

## Deploy

Hosted on Cloudflare Pages: `wrangler pages deploy . --project-name juliosuas`

## Credits

- Pixelify Sans: © The Pixelify Sans Project Authors, SIL OFL 1.1 (`fonts/OFL-PixelifySans.txt`)
- VT323: © The VT323 Project Authors, SIL OFL 1.1 (`fonts/OFL-VT323.txt`)
- The icons, logo, patterns and CSS are original work. The look is inspired by 1-bit desktop GUIs from the 1980s.
