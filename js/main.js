'use strict';

/* ============================================================
   CURSOR (desktop only)
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

  let cx = 0, cy = 0;
  let rx = 0, ry = 0;

  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
  });

  // Ring lags behind with rAF
  function animateRing() {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    ring.style.transform = `translate(${rx - cx}px, ${ry - cy}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state
  const hoverTargets = 'a, button, [role="button"], input, textarea, select, .service-item, .project';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) cursor.classList.remove('is-hover');
  });
  document.addEventListener('mousedown', () => cursor.classList.add('is-click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-click'));
}

/* ============================================================
   NAVIGATION — scroll state, burger, active links
   ============================================================ */
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll: add .is-scrolled class
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
    highlightActiveSection();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger toggle
  function setNavOpen(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (links) links.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger) {
    burger.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')));
  }

  // Close on link click (mobile)
  if (links) {
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => setNavOpen(false));
    });
  }

  // Close on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setNavOpen(false);
  });

  // Keyboard: Escape closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setNavOpen(false);
  });

  // Active section highlighting
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav__link');

  function highlightActiveSection() {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset - 80) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('is-active', href === current);
    });
  }
}

/* ============================================================
   SMOOTH SCROLL — respect nav height
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id  = anchor.getAttribute('href').replace('#', '');
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   HERO VERB CYCLING
   ============================================================ */
function initHeroVerb() {
  const el    = document.getElementById('heroVerb');
  if (!el) return;
  const verbs = ['BUILD', 'CREATE', 'SHIP', 'SOLVE'];
  let idx = 0;

  setInterval(() => {
    el.classList.add('fading');
    setTimeout(() => {
      idx = (idx + 1) % verbs.length;
      el.textContent = verbs[idx];
      el.classList.remove('fading');
    }, 320);
  }, 2600);
}

/* ============================================================
   SCROLL REVEAL — elements with class .reveal
   ============================================================ */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const revealEl = el => el.classList.add('is-visible');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealEl(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

  elements.forEach(el => {
    // Instantly reveal if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealEl(el);
    } else {
      observer.observe(el);
    }
  });
}

/* ============================================================
   TEXT LINE REVEALS — elements with .reveal-line children
   ============================================================ */
function initLineReveal() {
  const containers = document.querySelectorAll('.about__headline, .section-title, .contact__headline');
  if (!containers.length) return;

  const revealEl = el => el.classList.add('is-revealed');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealEl(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

  containers.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealEl(el);
    } else {
      observer.observe(el);
    }
  });
}

/* ============================================================
   CANVAS PARTICLES — red particle network
   ============================================================ */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COLOR = '225, 29, 72';
  const PARTICLE_COUNT = 60;
  const MAX_DIST = 130;
  const SPEED = 0.4;

  let W, H, particles = [], raf;
  let active = true;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  class Particle {
    constructor() { this.reset(); this.x = Math.random() * W; this.y = Math.random() * H; }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r  = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, 0.55)`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${COLOR}, ${(1 - d / MAX_DIST) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  // Start loop; pause when hero leaves viewport
  const heroSection = canvas.closest('section');
  if (heroSection) {
    new IntersectionObserver(entries => {
      const wasActive = active;
      active = entries[0].isIntersecting;
      if (active && !wasActive) draw();
      else if (!active) cancelAnimationFrame(raf);
    }, { threshold: 0 }).observe(heroSection);
  }

  draw();
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const ease = t => 1 - Math.pow(1 - t, 3);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1400;
      const start  = performance.now();
      observer.unobserve(el);

      function tick(now) {
        const p  = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(ease(p) * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   CONTACT FORM — Formspree integration
   ============================================================ */
function initForm() {
  const form       = document.getElementById('contactForm');
  const successEl  = document.getElementById('formSuccess');
  const resetBtn   = document.getElementById('resetFormBtn');
  const submitBtn  = document.getElementById('submitBtn');
  const netErr     = document.getElementById('formNetError');
  if (!form) return;

  let submitting = false;

  // Validators
  function validateName(val) {
    if (!val.trim()) return 'Please enter your name.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  }
  function validateEmail(val) {
    if (!val.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  }
  function validateMessage(val) {
    if (!val.trim()) return 'Please enter a message.';
    if (val.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  }

  function setError(fieldId, errId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(errId);
    if (!field || !errEl) return;
    if (msg) {
      field.classList.add('has-error');
      errEl.textContent = msg;
    } else {
      field.classList.remove('has-error');
      errEl.textContent = '';
    }
  }

  // Live clear on input
  form.querySelector('#contactName')?.addEventListener('input', e => {
    setError('fieldName', 'nameError', validateName(e.target.value));
  });
  form.querySelector('#contactEmail')?.addEventListener('input', e => {
    setError('fieldEmail', 'emailError', validateEmail(e.target.value));
  });
  form.querySelector('#contactMessage')?.addEventListener('input', e => {
    setError('fieldMessage', 'messageError', validateMessage(e.target.value));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;

    const name    = form.querySelector('#contactName')?.value || '';
    const email   = form.querySelector('#contactEmail')?.value || '';
    const message = form.querySelector('#contactMessage')?.value || '';

    const nameErr    = validateName(name);
    const emailErr   = validateEmail(email);
    const messageErr = validateMessage(message);

    setError('fieldName',    'nameError',    nameErr);
    setError('fieldEmail',   'emailError',   emailErr);
    setError('fieldMessage', 'messageError', messageErr);

    if (nameErr || emailErr || messageErr) return;

    // Hide previous net error
    if (netErr) { netErr.textContent = ''; netErr.classList.remove('visible'); }

    submitting = true;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      const res  = await fetch('https://formspree.io/f/xppzyqvo', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.classList.add('hidden');
        if (successEl) {
          successEl.classList.add('visible');
          successEl.setAttribute('aria-live', 'polite');
        }
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.errors?.[0]?.message || 'Something went wrong. Please try again.';
        if (netErr) { netErr.textContent = msg; netErr.classList.add('visible'); }
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitting = false;
      }
    } catch {
      if (netErr) {
        netErr.textContent = 'Unable to send. Please check your connection and try again.';
        netErr.classList.add('visible');
      }
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitting = false;
    }
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.classList.remove('hidden');
      if (successEl) successEl.classList.remove('visible');
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitting = false;
    });
  }
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initCursor();
  initNav();
  initSmoothScroll();
  initHeroVerb();
  initCanvas();
  initReveal();
  initLineReveal();
  initCounters();
  initForm();
});
