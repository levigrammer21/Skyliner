/* ============================================================
   SKYLINER MOTEL — site script
   ============================================================ */

/*  ROOM GALLERY
    Drop your photos into /img/rooms/ and add filenames here.
    The layout auto-fits based on the count (1-12 items work great).
    Recommended: 1600x1200 JPG, under 300kb each, descriptive alt text.

    To add an image, append to ROOM_IMAGES:
      { src: 'img/rooms/king-suite.jpg', alt: 'King suite with neon accent wall' }
*/
const ROOM_IMAGES = [
  // Example entries — replace these with your actual filenames once uploaded:
  // { src: 'img/rooms/01.jpg', alt: 'Queen room — clean lines, warm light' },
  // { src: 'img/rooms/02.jpg', alt: 'Double queen with retro lamp' },
  // { src: 'img/rooms/03.jpg', alt: 'Tiled bathroom, fresh towels' },
  // { src: 'img/rooms/04.jpg', alt: 'Exterior — sign at dusk' },
  // { src: 'img/rooms/05.jpg', alt: 'Courtyard view' },
];

/* Layout pattern — repeats if you have more images.
   Pattern creates visual variety so it never looks like a uniform grid. */
const LAYOUT_PATTERN = ['lg', 'sm', 'sm', 'wide', 'md', 'md', 'sm', 'sm', 'lg'];

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  if (ROOM_IMAGES.length === 0) {
    // Show inviting placeholders until photos are uploaded
    gallery.innerHTML = `
      <div class="gallery__item gallery__item--lg gallery__item--placeholder">
        <div>
          <span>Coming Soon</span>
          Photos arriving any day now —<br/>drop them into /img/rooms/
        </div>
      </div>
      <div class="gallery__item gallery__item--sm gallery__item--placeholder">
        <div><span>◆</span>Rooms</div>
      </div>
      <div class="gallery__item gallery__item--sm gallery__item--placeholder">
        <div><span>◆</span>Lobby</div>
      </div>
      <div class="gallery__item gallery__item--wide gallery__item--placeholder">
        <div><span>◆</span>Sign at dusk</div>
      </div>
      <div class="gallery__item gallery__item--md gallery__item--placeholder">
        <div><span>◆</span>Courtyard</div>
      </div>
    `;
    return;
  }

  gallery.innerHTML = ROOM_IMAGES.map((img, i) => {
    const size = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length];
    return `
      <figure class="gallery__item gallery__item--${size}">
        <img src="${img.src}" alt="${img.alt || 'Skyliner Motel room'}" loading="lazy" />
      </figure>
    `;
  }).join('');
}

/* Year stamp */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   ANALYTICS HOOKS
   ============================================================
   Every clickable CTA has a data-track="..." attribute.
   When you wire analytics (see README), this function will fire
   a custom event for each click. For now it just logs in dev.

   Cloudflare Web Analytics auto-tracks pageviews. To track CTA
   clicks as custom events, you'll need Cloudflare Web Analytics
   *Pro* or pair with Plausible/GA4. The hook below is ready
   either way.
   ============================================================ */
function attachTrackers() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const event = el.getAttribute('data-track');

      // ---- Plausible (uncomment when wired) ----
      // if (window.plausible) window.plausible(event);

      // ---- Google Analytics 4 (uncomment when wired) ----
      // if (window.gtag) window.gtag('event', event, {
      //   event_category: 'cta',
      //   event_label: el.textContent.trim()
      // });

      // Dev visibility
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[track]', event);
      }
    });
  });
}

/* ============================================================
   Subtle scroll-reveal for sections
   ============================================================ */
function attachReveals() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.rooms, .reviews, .find').forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)';
    observer.observe(section);
  });
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setYear();
  attachTrackers();
  attachReveals();
});
