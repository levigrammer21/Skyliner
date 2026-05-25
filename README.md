# Skyliner Motel — skylinermotel.com

Static site for the Skyliner Motel in Stroud, Oklahoma. Hosted on GitHub Pages via the `Skyliner` repo with `CNAME` pointing to skylinermotel.com.

```
/
├── index.html
├── style.css
├── script.js
├── sign.webp          ← the neon sign photo
├── CNAME              ← keep this!
├── images/            ← room photos go here
└── README.md
```

---

## Updating the sign image

Replace `sign.webp` in the repo root. If you want to use a different filename or location, edit the `SIGN_SRC` constant at the top of `script.js`.

The CSS animates whatever image you supply — a "power-on" flicker sequence on load, then occasional subtle flickers like real neon, with turquoise + red glow halos behind it.

## Adding room photos

1. Drop photos into the `images/` folder. Recommended: ~1600px wide, JPG, under 300kb.
2. Edit `script.js` and fill in the `ROOM_IMAGES` array:

```js
const ROOM_IMAGES = [
  { src: 'images/room-comfort-double.jpg', alt: 'Comfort double room with two double beds' },
  { src: 'images/bathroom.jpg',           alt: 'Updated tiled bathroom' },
  { src: 'images/lobby-mural.jpg',         alt: 'Lobby with welcome mural' },
  // ...up to 12 photos work well
];
```

Until you add photos, themed placeholders show in their place.

## Analytics

The site is prepped — every CTA has a `data-track` attribute. Pick one:

### Cloudflare Web Analytics (free, no cookies, recommended)
1. https://dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site → `skylinermotel.com`
2. Cloudflare gives you a `<script>` tag. Paste it into `<head>` in `index.html`.
3. Done. Pageviews tracked, no cookie banner needed.

### Plausible ($9/mo, supports custom events for CTA clicks)
1. Sign up at https://plausible.io → add `skylinermotel.com`
2. Paste their `<script>` tag into `<head>`
3. In `script.js`, uncomment the `window.plausible(event)` line in `attachTrackers()`

Tracked CTAs: `book-topbar`, `book-hero`, `book-rooms`, `book-visit`, `book-float`, `see-rooms`, `phone`, `map`, `nearby-rockcafe`, `nearby-museum`, `nearby-park`, `nearby-coffee`.

## Booking link

All "Book" buttons go to: `https://us2.cloudbeds.com/reservation/PmV5Jg`

If this changes, do a find-and-replace across `index.html`.

## Current real info on the site

- **Address:** 717 W Main St, Stroud, OK 74079
- **Phone:** (918) 290-0637
- **10 rooms** — Comfort Single (1 double bed), Deluxe Single (1 queen), Comfort Double (2 double beds)
- **Check-in:** 3:00 PM / **Check-out:** 11:00 AM
- **24-hour contactless entry** via per-guest room codes
- **Amenities:** Free Wi-Fi, free self-parking, mini-fridge, flat-screen TV, A/C, daily housekeeping, free coffee in lobby
- **History:** Built late 1950s by Jack & Lorene Tarter. Restored 2025-2026 by Charles Palmer & Cody Paige.
- **Sign:** Original turquoise and red neon, fully restored
- **Nearby:** Rock Cafe (10% off with Skyliner receipt), Route 66 Spirit of America Museum, Ed Smalley Centennial Park, Gathering Grounds Coffee
