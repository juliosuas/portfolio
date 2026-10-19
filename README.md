# juliosuas — retro desktop portfolio (prototype)

Static site, no build step: plain HTML + CSS + ~150 lines of vanilla JS.
Deploy the folder as-is to GitHub Pages or Cloudflare Pages.

- `index.html` – desktop: menu bar, icons, draggable windows (About, Upstream work, Projects, Contact, Trash)
- `404.html` – "System Error" bomb dialog (uses root-absolute paths `/style.css`, assumes the site lives at the domain root)
- `style.css` – design tokens + theme (original CSS)
- `desktop.js` – window manager (Pointer Events → mouse + touch; Esc closes; Alt+Arrows moves a focused window title)
- `fonts/` – self-hosted OFL fonts + their licenses

Behaviour: ≥769px wide → floating windows you can drag; ≤768px → windows stack vertically and scroll normally.
Without JS everything is visible and stacked. Honors `prefers-reduced-motion` and `forced-colors`.

## TODO before launch
- Bio text in About
- LinkedIn URL in Contact
- Confirm email address
- `og:url` / canonical + `CNAME` once the domain is bought

## Credits / licenses
- Pixelify Sans — © The Pixelify Sans Project Authors, SIL OFL 1.1 (`fonts/OFL-PixelifySans.txt`)
- VT323 — © The VT323 Project Authors, SIL OFL 1.1 (`fonts/OFL-VT323.txt`)
- All icons, logo, patterns and CSS are original; the look is inspired by 1980s 1-bit desktop GUIs.
