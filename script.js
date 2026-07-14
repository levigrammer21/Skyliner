/* SKYLINER MOTEL — site script */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const IMAGE_BASENAMES = [
  'IMG_20260714_055554',
  'IMG_20260714_055558',
  'IMG_20260714_055600',
  'IMG_20260714_055606',
  'IMG_20260714_055608',
  'IMG_20260714_055612',
  'IMG_20260714_055615',
  'IMG_20260714_055620',
  'IMG_20260714_055627'
];

const LAYOUT_PATTERN = ['lg', 'sm', 'sm', 'wide', 'md', 'md', 'sm', 'sm', 'lg'];
let motelImages = [];
let heroIndex = 0;
let heroTimer = null;
let lightboxIndex = 0;

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadMotelImages() {
  const candidates = [];
  for (const name of IMAGE_BASENAMES) {
    for (const ext of IMAGE_EXTENSIONS) candidates.push(`images/${name}.${ext}`);
  }
  const results = await Promise.all(candidates.map(imageExists));
  const seen = new Set();
  motelImages = results.filter(Boolean).filter((src) => {
    const base = src.replace(/\.[^.]+$/, '');
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
  return motelImages;
}

function friendlyCaption(src, index) {
  return `Skyliner Motel photo ${index + 1} of ${motelImages.length}`;
}

function showHeroImage(index) {
  if (!motelImages.length) return;
  heroIndex = (index + motelImages.length) % motelImages.length;
  const wrapper = document.getElementById('hero-photo');
  const image = document.getElementById('hero-image');
  const counter = document.getElementById('hero-photo-counter');
  if (!wrapper || !image) return;

  image.classList.add('is-changing');
  window.setTimeout(() => {
    image.src = motelImages[heroIndex];
    image.alt = friendlyCaption(motelImages[heroIndex], heroIndex);
    if (counter) counter.textContent = `${heroIndex + 1} / ${motelImages.length}`;
    wrapper.classList.add('has-image');
    image.classList.remove('is-changing');
  }, 180);
}

function startHeroRotation() {
  if (motelImages.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.clearInterval(heroTimer);
  heroTimer = window.setInterval(() => showHeroImage(heroIndex + 1), 4500);
}

function openLightbox(index) {
  if (!motelImages.length) return;
  lightboxIndex = (index + motelImages.length) % motelImages.length;
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  image.src = motelImages[lightboxIndex];
  image.alt = friendlyCaption(motelImages[lightboxIndex], lightboxIndex);
  caption.textContent = friendlyCaption(motelImages[lightboxIndex], lightboxIndex);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  document.getElementById('hero-photo')?.focus();
}

function attachLightbox() {
  const lightbox = document.getElementById('lightbox');
  document.getElementById('hero-photo')?.addEventListener('click', () => openLightbox(heroIndex));
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => openLightbox(lightboxIndex - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => openLightbox(lightboxIndex + 1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
    if (event.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
  });
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  if (!motelImages.length) {
    gallery.innerHTML = '<div class="gallery__empty"><div><strong>Add your motel photos</strong>Photos placed in the <code>images</code> folder will appear here.</div></div>';
    return;
  }
  gallery.innerHTML = motelImages.map((src, i) => {
    const size = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length];
    const caption = friendlyCaption(src, i);
    return `<figure class="gallery__item gallery__item--${size}"><button type="button" class="gallery__button" data-photo-index="${i}" aria-label="Open ${caption}"><img src="${src}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption></button></figure>`;
  }).join('');
  gallery.querySelectorAll('[data-photo-index]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(Number(button.dataset.photoIndex)));
  });
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function attachTrackers() {
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      if (['localhost', '127.0.0.1'].includes(window.location.hostname)) console.log('[track]', el.getAttribute('data-track'));
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

document.addEventListener('DOMContentLoaded', async () => {
  await loadMotelImages();
  showHeroImage(0);
  renderGallery();
  attachLightbox();
  startHeroRotation();
  setYear();
  attachTrackers();
  attachReveals();
});
