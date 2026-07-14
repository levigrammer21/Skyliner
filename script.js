/* SKYLINER MOTEL — site script */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const HERO_BASENAMES = ['sign', 'skyliner-sign', 'exterior', 'motel-exterior', 'front'];
const GALLERY_BASENAMES = [
  'motel-01','motel-02','motel-03','motel-04','motel-05','motel-06','motel-07','motel-08','motel-09','motel-10','motel-11','motel-12',
  'room-01','room-02','room-03','room-04','room-05','room-06',
  'exterior-01','exterior-02','exterior-03','interior-01','interior-02','interior-03',
  'lobby','bathroom','sign','exterior','front'
];
const LAYOUT_PATTERN = ['lg', 'sm', 'sm', 'wide', 'md', 'md', 'sm', 'sm', 'lg'];

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function findFirstImage(basenames) {
  for (const name of basenames) {
    for (const ext of IMAGE_EXTENSIONS) {
      const src = `images/${name}.${ext}`;
      if (await imageExists(src)) return src;
    }
  }
  return null;
}

function friendlyCaption(src) {
  const file = src.split('/').pop().replace(/\.[^.]+$/, '');
  if (file.includes('room') || file.includes('interior')) return 'Inside the Skyliner Motel';
  if (file.includes('bath')) return 'Updated motel bathroom';
  if (file.includes('lobby')) return 'Skyliner Motel lobby';
  if (file.includes('sign')) return 'The restored Skyliner Motel sign';
  return 'Skyliner Motel in Stroud, Oklahoma';
}

async function renderHeroPhoto() {
  const wrapper = document.getElementById('hero-photo');
  const image = document.getElementById('hero-image');
  if (!wrapper || !image) return;
  const src = await findFirstImage(HERO_BASENAMES);
  if (!src) return;
  image.src = src;
  wrapper.classList.add('has-image');
}

async function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const candidates = [];
  for (const name of GALLERY_BASENAMES) {
    for (const ext of IMAGE_EXTENSIONS) candidates.push(`images/${name}.${ext}`);
  }
  const results = await Promise.all(candidates.map(imageExists));
  const seen = new Set();
  const images = results.filter(Boolean).filter((src) => {
    const base = src.replace(/\.[^.]+$/, '');
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });

  if (!images.length) {
    gallery.innerHTML = `<div class="gallery__empty"><div><strong>Add your motel photos</strong>Upload files such as <code>images/motel-01.jpg</code>, <code>images/room-01.jpg</code>, and <code>images/exterior-01.jpg</code>. They will appear here automatically.</div></div>`;
    return;
  }

  gallery.innerHTML = images.map((src, i) => {
    const size = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length];
    const caption = friendlyCaption(src);
    return `<figure class="gallery__item gallery__item--${size}"><img src="${src}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
  }).join('');
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function attachTrackers() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        console.log('[track]', el.getAttribute('data-track'));
      }
    });
  });
}

function attachReveals() {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    section.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
    observer.observe(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeroPhoto();
  renderGallery();
  setYear();
  attachTrackers();
  attachReveals();
});
