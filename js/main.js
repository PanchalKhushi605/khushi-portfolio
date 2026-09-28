(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Navigation ---- */
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children].filter((el) => el.classList.contains('reveal'));
        entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 90}ms`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Laptop slideshow ---- */
  const slides = document.querySelectorAll('.slide');
  if (slides.length > 1 && !reduceMotion) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, 3200);
  }

  /* ---- Lightbox ---- */
  const cards = [...document.querySelectorAll('.card')];
  const box = document.getElementById('lightbox');
  const img = box.querySelector('.lightbox__img');
  const title = document.getElementById('lb-title');
  const desc = document.getElementById('lb-desc');
  let index = 0;
  let lastFocus = null;

  const show = (i) => {
    index = (i + cards.length) % cards.length;
    const card = cards[index];
    const thumb = card.querySelector('img');
    img.src = card.dataset.full || thumb.src;
    img.alt = thumb.alt;
    title.textContent = card.querySelector('.card__label').textContent;
    desc.textContent = card.querySelector('.card__desc').textContent;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__close').focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  cards.forEach((card, i) => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${card.querySelector('.card__label').textContent}`);
    card.addEventListener('click', () => open(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(index - 1));
  box.querySelector('.lightbox__nav--next').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      const focusables = [...box.querySelectorAll('button')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---- Footer year ---- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
