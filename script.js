/* SKYLINER MOTEL — slideshow, gallery, and lightbox */

const MOTEL_IMAGES = [
  'images/IMG_20260714_055554.jpg',
  'images/IMG_20260714_055558.jpg',
  'images/IMG_20260714_055600.jpg',
  'images/IMG_20260714_055606.jpg',
  'images/IMG_20260714_055608.jpg',
  'images/IMG_20260714_055612.jpg',
  'images/IMG_20260714_055615.jpg',
  'images/IMG_20260714_055620.jpg',
  'images/IMG_20260714_055627.jpg'
];

const LAYOUT_PATTERN = ['lg', 'sm', 'sm', 'wide', 'md', 'md', 'sm', 'sm', 'lg'];
const SLIDE_INTERVAL_MS = 2000;

let availableImages = [];
let currentIndex = 0;
let slideshowTimer = null;

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function friendlyCaption(src, index) {
  return `Skyliner Motel photo ${index + 1}`;
}

async function loadAvailableImages() {
  const results = await Promise.all(MOTEL_IMAGES.map(imageExists));
  availableImages = results.filter(Boolean);
  return availableImages;
}

function updateHeroPhoto(index, animate = true) {
  const wrapper = document.getElementById('hero-photo');
  const image = document.getElementById('hero-image');
  const counter = document.getElementById('hero-photo-counter');

  if (!wrapper || !image || !availableImages.length) return;

  currentIndex = (index + availableImages.length) % availableImages.length;
  const nextSrc = availableImages[currentIndex];

  if (animate && image.src) {
    wrapper.classList.add('is-changing');
    window.setTimeout(() => {
      image.src = nextSrc;
      image.alt = friendlyCaption(nextSrc, currentIndex);
      wrapper.classList.remove('is-changing');
    }, 180);
  } else {
    image.src = nextSrc;
    image.alt = friendlyCaption(nextSrc, currentIndex);
  }

  wrapper.classList.add('has-image');
  if (counter) counter.textContent = `${currentIndex + 1} / ${availableImages.length}`;
}

function nextSlide() {
  updateHeroPhoto(currentIndex + 1);
}

function startSlideshow() {
  stopSlideshow();
  if (availableImages.length < 2) return;
  slideshowTimer = window.setInterval(nextSlide, SLIDE_INTERVAL_MS);
}

function stopSlideshow() {
  if (slideshowTimer) {
    window.clearInterval(slideshowTimer);
    slideshowTimer = null;
  }
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  if (!availableImages.length) {
    gallery.innerHTML = `
      <div class="gallery__empty">
        <div><strong>No photos found</strong>Check that the JPG files are inside the root <code>images</code> folder.</div>
      </div>`;
    return;
  }

  gallery.innerHTML = availableImages.map((src, i) => {
    const size = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length];
    const caption = friendlyCaption(src, i);
    return `
      <button class="gallery__item gallery__item--${size}" type="button" data-photo-index="${i}" aria-label="Open ${caption}">
        <img src="${src}" alt="${caption}" loading="lazy">
        <span class="gallery__zoom">View larger</span>
      </button>`;
  }).join('');

  gallery.querySelectorAll('[data-photo-index]').forEach((item) => {
    item.addEventListener('click', () => {
      openLightbox(Number(item.dataset.photoIndex));
    });
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !availableImages.length) return;

  currentIndex = (index + availableImages.length) % availableImages.length;
  updateLightbox();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  stopSlideshow();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  updateHeroPhoto(currentIndex, false);
  startSlideshow();
}

function updateLightbox() {
  const image = document.getElementById('lightbox-image');
  const caption = document.getElementById('lightbox-caption');
  if (!image || !availableImages.length) return;

  image.src = availableImages[currentIndex];
  image.alt = friendlyCaption(availableImages[currentIndex], currentIndex);
  if (caption) caption.textContent = `${currentIndex + 1} of ${availableImages.length}`;
}

function changeLightbox(direction) {
  currentIndex = (currentIndex + direction + availableImages.length) % availableImages.length;
  updateLightbox();
}

function attachLightbox() {
  const hero = document.getElementById('hero-photo');
  const lightbox = document.getElementById('lightbox');
  const close = document.getElementById('lightbox-close');
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');

  hero?.addEventListener('click', () => openLightbox(currentIndex));
  close?.addEventListener('click', closeLightbox);
  prev?.addEventListener('click', () => changeLightbox(-1));
  next?.addEventListener('click', () => changeLightbox(1));

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') changeLightbox(-1);
    if (event.key === 'ArrowRight') changeLightbox(1);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSlideshow();
    else if (!lightbox?.classList.contains('is-open')) startSlideshow();
  });
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

async function init() {
  await loadAvailableImages();

  if (availableImages.length) {
    updateHeroPhoto(0, false);
    renderGallery();
    attachLightbox();
    startSlideshow();
  } else {
    renderGallery();
  }

  setYear();
  attachTrackers();
}

document.addEventListener('DOMContentLoaded', init);
