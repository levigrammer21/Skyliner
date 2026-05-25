# Skyliner Motel — Website

A neon-soaked single-page site for the Skyliner Motel on Route 66. Static HTML/CSS/JS — drop on GitHub Pages and go.

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   └── rooms/         ← put your room photos here
└── README.md
```

---

## 1. Deploy to GitHub Pages

If your repo is already wired up to `skylinermotel.com`, just push these files to the same branch you were using (usually `main` or `gh-pages`). No build step — it's static.

```
git add .
git commit -m "Neon rework"
git push
```

---

## 2. Add room photos

1. Drop your photos into `/img/rooms/`. Recommended: **1600×1200 JPG, under 300kb each.**
2. Open `js/script.js` and edit the `ROOM_IMAGES` array:

```js
const ROOM_IMAGES = [
  { src: 'img/rooms/01.jpg', alt: 'Queen room with retro lamp' },
  { src: 'img/rooms/02.jpg', alt: 'Tiled bathroom, fresh towels' },
  { src: 'img/rooms/03.jpg', alt: 'Sign at dusk' },
  // ...add as many as you like
];
```

The gallery auto-arranges using a built-in layout pattern (large hero + smaller tiles) so 3, 5, 9 images all look intentional. Until you add photos, themed placeholders show in their place.

---

## 3. Wire up analytics (backend-first, no placeholders)

The site is fully prepped for analytics — every CTA has a `data-track` attribute and the JS has commented hooks ready. **Pick one** and follow the steps:

### Option A — Cloudflare Web Analytics ⭐ recommended

Free, privacy-friendly, no cookie banner required, no GDPR/CCPA headache.

1. Go to https://dash.cloudflare.com → **Analytics & Logs → Web Analytics**
2. Click **Add a site** → enter `skylinermotel.com`
3. Cloudflare gives you a `<script>` snippet with a `token` value
4. In `index.html`, find the comment block near the top labeled `ANALYTICS` and uncomment Option A, pasting in your real token

That's it for pageviews. (Cloudflare's free tier doesn't do custom events; if you want CTA click tracking, use Option B instead or pair them.)

### Option B — Plausible

$9/mo, simple dashboard, also privacy-friendly, **does** support custom events.

1. Sign up at https://plausible.io → add site `skylinermotel.com`
2. In `index.html`, uncomment the Plausible script tag in the ANALYTICS block
3. In `js/script.js`, uncomment the `window.plausible(event)` line inside `attachTrackers()`

Now every "Book Now" click fires a named event (`book-hero`, `book-topbar`, `book-rooms`, `book-find`, `book-float`, `phone`, `see-rooms`) you can filter in the Plausible dashboard.

### Option C — Google Analytics 4

Free but heavier and requires a cookie banner in most jurisdictions. Steps similar — add gtag snippet to `<head>`, uncomment the gtag block in `script.js`.

---

## 4. Track what matters

The CTAs already labeled for tracking:

| `data-track` value | Where it lives |
|---|---|
| `book-topbar` | Top-right Book Now button |
| `book-hero` | Main hero CTA |
| `book-rooms` | After the gallery |
| `book-find` | Find Us section |
| `book-float` | Floating mobile button |
| `see-rooms` | "See the rooms" ghost button |
| `phone` | Phone number click |

This lets you see which CTA is converting once analytics is wired.

---

## 5. The booking link

All booking buttons point to:
```
https://us2.cloudbeds.com/reservation/PmV5Jg
```
If this ever changes, do a project-wide find-and-replace on that URL.

---

## Design notes

- **Theme:** Pure neon. Midnight ink background, hot magenta + electric cyan + amber accents.
- **The sign is the hero** — recreated in pure CSS so it actually flickers, no image needed. Lives in the top-left of the hero on desktop, top-center on mobile.
- **Fonts:** Monoton (sign), Bungee (display), JetBrains Mono (body). Loaded from Google Fonts.
- **Motion:** Sign flicker, chasing bulbs on the arrow, twinkling stars, scrolling marquee, scroll-reveal on sections. All respects `prefers-reduced-motion`.
- **Accessibility:** Skip link, semantic HTML, ARIA labels on the sign, alt text on gallery images, keyboard-navigable.

---

## Updating content

| What | Where |
|---|---|
| Phone number | `index.html` — search `(555) 123-4567` (two places: topbar + Find section) |
| Address | `index.html` — search `123 Historic Route 66` |
| Check-in/out times | `index.html` — Find section |
| Reviews | `index.html` — `<section class="reviews">` |
| Marquee text | `index.html` — `<div class="marquee__track">` |
