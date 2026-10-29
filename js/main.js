(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  /* ---- Doodles: hand-drawn strokes draw themselves, filled shapes pop in ---- */
  const strokeDoodles = ['#smiley', '#scribble', '#curly-arrow', '#loops', '#burst', '#flower', '#heart-sketch'];
  const fillDoodles = ['#stars', '#heart', '#dots', '#flower-fill'];
  $$('main svg > use').forEach((use) => {
    const svg = use.parentNode;
    const id = use.getAttribute('href');
    if (strokeDoodles.includes(id)) svg.classList.add('draw');
    else if (fillDoodles.includes(id)) svg.classList.add('pop');
  });

  /* ---- Split the hero title into letters ---- */
  const title = $('.hero__title');
  if (title) {
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    const frag = document.createDocumentFragment();
    let i = 0;
    [...title.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) { frag.append(node.cloneNode(true)); return; }
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part.trim()) { if (part) frag.append(' '); return; }
        const word = document.createElement('span');
        word.className = 'word';
        word.setAttribute('aria-hidden', 'true');
        [...part].forEach((ch) => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = ch;
          c.style.setProperty('--i', i++);
          word.append(c);
        });
        frag.append(word);
      });
    });
    title.replaceChildren(frag);
    if (finePointer && !reduceMotion) {
      title.addEventListener('mouseover', (e) => {
        const c = e.target.closest('.char');
        if (!c || c.classList.contains('is-jumping')) return;
        c.classList.add('is-jumping');
        c.addEventListener('animationend', () => c.classList.remove('is-jumping'), { once: true });
      });
    }
  }

  /* ---- Mission sentence: words float in one by one ---- */
  const mission = $('.mission__text');
  if (mission) {
    const frag = document.createDocumentFragment();
    let i = 0;
    [...mission.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) {
        node.classList.add('w');
        node.style.setProperty('--i', i++);
        frag.append(node);
        return;
      }
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part.trim()) { if (part) frag.append(' '); return; }
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        w.style.setProperty('--i', i++);
        frag.append(w);
      });
    });
    mission.replaceChildren(frag);
  }

  /* ---- Hand-drawn squiggle under section titles ---- */
  $$('.section-title').forEach((t) => {
    t.insertAdjacentHTML('beforeend', '<svg class="squiggle" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M4 13 C 40 3, 70 19, 106 10 S 172 3, 206 11 S 268 18, 296 7"/></svg>');
  });

  /* ---- Process steps: numbered badges and a ring that draws itself ---- */
  $$('.step__circle').forEach((circle, i) => {
    circle.insertAdjacentHTML('afterbegin',
      `<svg class="step__ring" viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="1" cx="50" cy="50" r="48.5"/></svg><span class="step__num" aria-hidden="true">0${i + 1}</span>`);
  });

  /* ---- Project cards: "View project" hint ---- */
  const cards = $$('.card');
  cards.forEach((card) => {
    $('.card__media', card).insertAdjacentHTML('beforeend',
      '<span class="card__view" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>View project</span>');
  });

  /* ---- Skills ticker: duplicate each track so it loops seamlessly ---- */
  $$('.marquee__track').forEach((track) => track.insertAdjacentHTML('beforeend', track.innerHTML));

  /* ---- Navigation ---- */
  const nav = $('#nav');
  const toggle = $('.nav__toggle', nav);
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });

  /* ---- Scroll: nav state, progress bar, back-to-top ring, doodle parallax ---- */
  const bar = $('.progress span');
  const toTop = $('.to-top');
  const toTopRing = $('.to-top__bar');
  const parallax = reduceMotion ? [] : $$('main .section:not(.hero) .doodle:not(.blob)').map((el, i) => ({
    el, section: el.closest('.section'), speed: i % 2 ? 0.12 : 0.06,
  }));
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    nav.classList.toggle('is-scrolled', y > 24);
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (toTop) {
      toTop.classList.toggle('is-visible', y > 700);
      toTopRing.style.strokeDashoffset = String(126 * (1 - p));
    }
    const vh = window.innerHeight;
    parallax.forEach(({ el, section, speed }) => {
      const r = section.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.translate = `0 ${((r.top + r.height / 2) - vh / 2) * -speed}px`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---- Count-up numbers ---- */
  const countUp = (el) => {
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const start = performance.now();
    const dur = 1400;
    const frame = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  /* ---- Everything that animates in on scroll (started after the intro) ---- */
  const startScrollAnimations = () => {
    const reveals = $$('.reveal');
    const inView = $$('.brush, .draw, .pop, .section-title, .step, .mission__text, [data-count]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      inView.forEach((el) => el.classList.add('is-in'));
      $$('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
      return;
    }
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children].filter((el) => el.classList.contains('reveal'));
        entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 90}ms`;
        entry.target.classList.add('is-visible');
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => revealIO.observe(el));

    const inIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        if (entry.target.dataset.count) countUp(entry.target);
        inIO.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    inView.forEach((el) => inIO.observe(el));
  };

  /* ---- Intro screen (first visit per session only) ---- */
  const loader = $('.loader');
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    document.body.classList.add('is-loaded');
    startScrollAnimations();
  };
  let introSeen = false;
  try { introSeen = sessionStorage.getItem('kp-intro') === '1'; sessionStorage.setItem('kp-intro', '1'); } catch (e) { /* storage blocked */ }
  if (!loader || reduceMotion || introSeen) {
    if (loader) loader.remove();
    requestAnimationFrame(start);
  } else {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      loader.classList.add('is-done');
      start();
      setTimeout(() => loader.remove(), 1000);
    };
    const minTime = new Promise((r) => setTimeout(r, 1400));
    const pageLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
    Promise.all([minTime, pageLoaded]).then(finish);
    setTimeout(finish, 3200);
  }

  /* ---- Typing role line ---- */
  const rot = $('.rotator');
  if (rot && !reduceMotion) {
    const words = JSON.parse(rot.dataset.words);
    let w = 0;
    let n = words[0].length;
    let deleting = true;
    const step = () => {
      if (deleting) {
        n -= 1;
        if (n <= 0) { n = 0; deleting = false; w = (w + 1) % words.length; }
      } else {
        n += 1;
        if (n >= words[w].length) {
          rot.textContent = words[w];
          deleting = true;
          setTimeout(step, 1900);
          return;
        }
      }
      rot.textContent = words[w].slice(0, n);
      setTimeout(step, deleting ? 45 : 90);
    };
    setTimeout(step, 3200);
  }

  /* ---- Laptop slideshow with clickable dots ---- */
  const slides = $$('.slide');
  const dotsWrap = $('.slides__dots');
  if (slides.length > 1) {
    let current = 0;
    let timer = null;
    const dots = slides.map((slide, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show ${slide.alt}`);
      b.addEventListener('click', () => { show(i); restart(); });
      dotsWrap.append(b);
      return b;
    });
    const show = (i) => {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => show(current + 1), 3200);
    };
    dots[0].classList.add('is-active');
    restart();
  }

  /* ---- Pointer-only extras: cursor, magnetic buttons, tilt, hero parallax ---- */
  const cursor = $('.cursor');
  if (finePointer && !reduceMotion) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cursor.classList.add('is-on'); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    const follow = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.addEventListener('pointerover', (e) => {
      const onCard = !!e.target.closest('.card');
      cursor.classList.toggle('is-view', onCard);
      cursor.classList.toggle('is-link', !onCard && !!e.target.closest('a, button, .chip, .tools li'));
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });

    cards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transition = 'transform .12s ease-out';
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-6px)`;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.transition = ''; card.style.transform = ''; });
    });

    const hero = $('.hero');
    const layers = $$('[data-depth]', hero);
    const laptop = $('.laptop', hero);
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => { l.style.translate = `${nx * Number(l.dataset.depth)}px ${ny * Number(l.dataset.depth)}px`; });
      if (laptop && laptop.classList.contains('is-visible')) {
        laptop.style.transition = 'transform .4s ease-out';
        laptop.style.transform = `perspective(1400px) rotateY(${nx * -10}deg) rotateX(${ny * 7}deg)`;
      }
    });
    hero.addEventListener('pointerleave', () => {
      layers.forEach((l) => { l.style.translate = ''; });
      if (laptop) laptop.style.transform = '';
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---- Work filter ---- */
  const chips = $$('.chip');
  const galleries = $$('.gallery[data-cat]');
  const markFirst = () => {
    const first = galleries.find((g) => !g.hidden);
    galleries.forEach((g) => g.classList.toggle('is-first', g === first));
    return first;
  };
  chips.forEach((chip) => {
    const f = chip.dataset.filter;
    const count = galleries.filter((g) => f === 'all' || g.dataset.cat === f)
      .reduce((sum, g) => sum + $$('.card', g).length, 0);
    chip.insertAdjacentHTML('beforeend', `<sup>${count}</sup>`);
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      galleries.forEach((g) => {
        const show = f === 'all' || g.dataset.cat === f;
        if (show) {
          g.hidden = false;
          requestAnimationFrame(() => g.classList.remove('is-out'));
        } else {
          g.classList.add('is-out');
        }
      });
      setTimeout(() => {
        galleries.forEach((g) => { if (g.classList.contains('is-out')) g.hidden = true; });
        const first = markFirst();
        if (first) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        onScroll();
      }, reduceMotion ? 0 : 320);
    });
  });
  markFirst();

  /* ---- Lightbox ---- */
  const box = $('#lightbox');
  const img = $('.lightbox__img', box);
  const frame = $('.lightbox__frame', box);
  const lbTitle = $('#lb-title');
  const lbDesc = $('#lb-desc');
  const lbMeta = $('#lb-meta');
  let index = 0;
  let lastFocus = null;
  img.addEventListener('load', () => {
    box.classList.toggle('is-tall', img.naturalHeight > img.naturalWidth * 2);
  });
  const visibleCards = () => cards.filter((c) => !c.closest('.gallery').hidden);
  const show = (i) => {
    const list = visibleCards();
    index = (i + list.length) % list.length;
    const card = list[index];
    const thumb = $('img', card);
    box.classList.remove('is-tall');
    frame.scrollTop = 0;
    img.src = card.dataset.full || thumb.src;
    img.alt = thumb.alt;
    lbTitle.textContent = $('.card__label', card).textContent;
    lbDesc.textContent = $('.card__desc', card).textContent;
    const category = $('.section-title', card.closest('.gallery')).textContent.trim();
    lbMeta.innerHTML = '';
    [category, card.dataset.tools].filter(Boolean).forEach((t) => {
      const s = document.createElement('span');
      s.textContent = t;
      lbMeta.append(s);
    });
  };
  const open = (card) => {
    lastFocus = document.activeElement;
    show(visibleCards().indexOf(card));
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', box).focus();
  };
  const close = () => {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${$('.card__label', card).textContent}`);
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });
  $('.lightbox__close', box).addEventListener('click', close);
  $('.lightbox__nav--prev', box).addEventListener('click', () => show(index - 1));
  $('.lightbox__nav--next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  let touchX = null;
  box.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      const focusables = $$('button', box);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---- Copy email: toast + little burst of stars and hearts ---- */
  const toast = $('.toast');
  let toastTimer = null;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2400);
  };
  const burst = (el) => {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    const colors = ['#DE9892', '#DDB261', '#A6BBC6'];
    for (let i = 0; i < 16; i++) {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '-50 -50 100 100');
      s.setAttribute('class', 'spark');
      s.innerHTML = i % 3 ? '<use href="#p-star"/>' : '<use href="#p-heart" transform="translate(-50 -50)"/>';
      const a = Math.random() * Math.PI * 2;
      const d = 60 + Math.random() * 110;
      s.style.color = colors[i % 3];
      s.style.left = `${r.left + r.width / 2}px`;
      s.style.top = `${r.top + r.height / 2}px`;
      s.style.setProperty('--tx', `${Math.cos(a) * d}px`);
      s.style.setProperty('--ty', `${Math.sin(a) * d}px`);
      s.style.setProperty('--rot', `${Math.round(Math.random() * 360)}deg`);
      document.body.append(s);
      s.addEventListener('animationend', () => s.remove());
    }
  };
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        showToast('Email copied! Talk soon ♡');
      } catch (e) {
        showToast(btn.dataset.copy);
      }
      burst(btn);
    });
  });

  /* ---- Footer year ---- */
  $('#year').textContent = new Date().getFullYear();
})();
