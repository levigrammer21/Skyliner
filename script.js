/* ============================================================
   SKYLINER MOTEL — site script
   ============================================================ */

/* ============================================================
   THE SIGN
   ============================================================
   Inject the real sign photo into the hero. To swap the image,
   change SIGN_SRC below to your filename in the repo root.
   ============================================================ */
const SIGN_SRC = 'sign.webp';
const SIGN_ALT = 'The restored turquoise and red neon Skyliner Motel sign on Route 66 in Stroud, Oklahoma';

function renderSign() {
  const stage = document.getElementById('sign-stage');
  if (!stage) return;
  stage.innerHTML = `<img class="sign-stage__img" src="${SIGN_SRC}" alt="${SIGN_ALT}" />`;
}

/* ============================================================
   ROOM GALLERY
   ============================================================
   When you have room photos, drop them in the repo root (or in
   /images/ if you prefer) and list them here. The gallery
   auto-arranges with a layout pattern that handles 1-12 photos
   gracefully.
   ============================================================ */
const ROOM_IMAGES = [
  // Add entries like:
  // { src: 'images/room-1.jpg', alt: 'Comfort double room with two double beds' },
  // { src: 'images/bathroom.jpg', alt: 'Updated tiled bathroom' },
  // { src: 'images/lobby.jpg', alt: 'Lobby with Route 66 mural' },
];

const LAYOUT_PATTERN = ['lg', 'sm', 'sm', 'wide', 'md', 'md', 'sm', 'sm', 'lg'];

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  if (ROOM_IMAGES.length === 0) {
    gallery.innerHTML = `
      <div class="gallery__item gallery__item--lg gallery__item--placeholder">
        <div>
          <span>Photos arriving soon</span>
          The rooms have been rebuilt from the studs.<br/>
          Photos coming straight from the property.
        </div>
      </div>
      <div class="gallery__item gallery__item--sm gallery__item--placeholder">
        <div><span>◆</span>Rooms</div>
      </div>
      <div class="gallery__item gallery__item--sm gallery__item--placeholder">
        <div><span>◆</span>Bathrooms</div>
      </div>
      <div class="gallery__item gallery__item--wide gallery__item--placeholder">
        <div><span>◆</span>The sign at dusk</div>
      </div>
      <div class="gallery__item gallery__item--md gallery__item--placeholder">
        <div><span>◆</span>Lobby</div>
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

/* ============================================================
   YEAR STAMP
   ============================================================ */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   ANALYTICS HOOKS
   ============================================================
   Every CTA has data-track="..." attached. Once you wire up
   analytics (see README), uncomment the relevant block.
   ============================================================ */
function attachTrackers() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const event = el.getAttribute('data-track');

      // Plausible:
      // if (window.plausible) window.plausible(event);

      // GA4:
      // if (window.gtag) window.gtag('event', event, {
      //   event_category: 'cta',
      //   event_label: el.textContent.trim()
      // });

      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[track]', event);
      }
    });
  });
}

/* ============================================================
   SCROLL REVEALS
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

  document.querySelectorAll('.story, .rooms, .nearby, .visit').forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)';
    observer.observe(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSign();
  renderGallery();
  setYear();
  attachTrackers();
  attachReveals();
});
