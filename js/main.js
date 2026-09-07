/* ============================================================
   HIREN SUTHAR PORTFOLIO — MAIN SCRIPT
   ============================================================ */

/* ---------- HERO CANVAS PARTICLE NETWORK ---------- */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx   = canvas.getContext('2d');
  const COLOR = '225, 29, 72'; // red accent
  let particles = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.28 + 0.06;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.init();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawLines() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    raf = requestAnimationFrame(frame);
  }

  // Pause when hero is off-screen
  const heroEl = document.getElementById('home');
  const visObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0.01 });
  if (heroEl) visObs.observe(heroEl);

  resize();
  buildParticles();
  frame();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildParticles(); }, 150);
  });
})();

/* ---------- NAVIGATION ---------- */
(function initNav() {
  const nav       = document.getElementById('nav');
  const burger    = document.getElementById('navBurger');
  const links     = document.getElementById('navLinks');
  const linkItems = document.querySelectorAll('.nav__link');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  linkItems.forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  function highlightActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 100;

    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        linkItems.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }
})();

/* ---------- SMOOTH SCROLL (respects nav height) ---------- */
(function initSmoothScroll() {
  const NAV_H = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 68;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({ top: target.offsetTop - NAV_H, behavior: 'smooth' });
      }
    });
  });
})();

/* ---------- SCROLL REVEAL ---------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const parent   = entry.target.parentElement;
      const siblings = parent ? [...parent.querySelectorAll('.reveal:not(.visible)')] : [];
      const idx      = siblings.indexOf(entry.target);
      const delay    = idx > 0 ? idx * 70 : 0;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);

      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  els.forEach(el => observer.observe(el));
})();

/* ---------- STAT COUNTERS (About section) ---------- */
(function initCounters() {
  const counters = document.querySelectorAll('.about__stat-val[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1400;
      const start  = performance.now();

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
})();

/* ---------- CONTACT FORM ---------- */
(function initForm() {
  const form       = document.getElementById('contactForm');
  const successEl  = document.getElementById('formSuccess');
  const netErrEl   = document.getElementById('formNetError');
  const btn        = document.getElementById('submitBtn');
  const resetBtn   = document.getElementById('resetFormBtn');
  if (!form || !btn) return;

  const ENDPOINT = 'https://formspree.io/f/xppzyqvo';

  const fields = {
    name:    { el: document.getElementById('contactName'),    err: document.getElementById('nameError'),    field: document.getElementById('fieldName')    },
    email:   { el: document.getElementById('contactEmail'),   err: document.getElementById('emailError'),   field: document.getElementById('fieldEmail')   },
    message: { el: document.getElementById('contactMessage'), err: document.getElementById('messageError'), field: document.getElementById('fieldMessage') },
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateName(val) {
    if (!val.trim()) return 'Name is required.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  }
  function validateEmail(val) {
    if (!val.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(val.trim())) return 'Please enter a valid email address.';
    return '';
  }
  function validateMessage(val) {
    if (!val.trim()) return 'Message is required.';
    if (val.trim().length < 10) return 'Message must be at least 10 characters.';
    return '';
  }

  const validators = { name: validateName, email: validateEmail, message: validateMessage };

  function showError(key, msg) {
    const f = fields[key];
    f.err.textContent = msg;
    f.field.classList.toggle('form-field--error', !!msg);
  }

  function validateField(key) {
    const f   = fields[key];
    const msg = validators[key](f.el.value);
    showError(key, msg);
    return !msg;
  }

  // Blur validation
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      // clear error once user starts correcting
      if (fields[key].field.classList.contains('form-field--error')) {
        validateField(key);
      }
    });
  });

  function setLoading(on) {
    btn.classList.toggle('loading', on);
    btn.disabled = on;
  }

  function hideNetError() {
    if (netErrEl) { netErrEl.textContent = ''; netErrEl.classList.remove('visible'); }
  }

  let submitting = false;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (submitting) return;

    hideNetError();

    // Validate all fields
    const validName    = validateField('name');
    const validEmail   = validateField('email');
    const validMessage = validateField('message');
    if (!validName || !validEmail || !validMessage) {
      // Focus first error
      for (const key of ['name', 'email', 'message']) {
        if (fields[key].field.classList.contains('form-field--error')) {
          fields[key].el.focus();
          break;
        }
      }
      return;
    }

    submitting = true;
    setLoading(true);

    try {
      const data = new FormData(form);
      const res  = await fetch(ENDPOINT, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        // Show success state
        form.style.display   = 'none';
        if (successEl) successEl.classList.add('visible');
      } else {
        const json = await res.json().catch(() => ({}));
        const msg  = (json.errors && json.errors.map(x => x.message).join(', ')) ||
                     `Server error (${res.status}). Please try again.`;
        if (netErrEl) { netErrEl.textContent = msg; netErrEl.classList.add('visible'); }
      }
    } catch {
      if (netErrEl) {
        netErrEl.textContent = 'Network error — please check your connection and try again.';
        netErrEl.classList.add('visible');
      }
    } finally {
      submitting = false;
      setLoading(false);
    }
  });

  // "Send Another Message" resets form and shows it again
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      Object.keys(fields).forEach(key => showError(key, ''));
      hideNetError();
      form.style.display   = '';
      if (successEl) successEl.classList.remove('visible');
      fields.name.el.focus();
    });
  }
})();

/* ---------- HERO VISUAL PARALLAX ---------- */
(function initParallax() {
  const visual  = document.getElementById('heroVisual');
  const hero    = document.getElementById('home');
  if (!visual || !hero) return;

  const win_    = visual.querySelector('.hv-window');
  let active    = true;

  const obs = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
  }, { threshold: 0.01 });
  obs.observe(hero);

  let cx = 0, cy = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    if (!active) return;
    const rect = hero.getBoundingClientRect();
    tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });

  function tick() {
    if (active) {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;

      visual.style.transform = `translate(${cx * 7}px, ${cy * 5}px)`;

      if (win_) {
        win_.style.transform =
          `translate(calc(-50% + ${cx * -3}px), calc(-50% + ${cy * -2}px))`;
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ---------- FOOTER YEAR ---------- */
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();
