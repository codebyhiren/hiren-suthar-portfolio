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
  const form  = document.getElementById('contactForm');
  const btn   = document.getElementById('submitBtn');
  if (!form || !btn) return;

  const textEl = btn.querySelector('.submit-text');
  const iconEl = btn.querySelector('.submit-icon');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let valid = true;
    inputs.forEach(inp => {
      if (!inp.value.trim()) { inp.style.borderColor = '#ef4444'; valid = false; }
      else inp.style.borderColor = '';
    });
    if (!valid) return;

    btn.disabled = true;
    textEl.textContent = 'Sending…';

    setTimeout(() => {
      btn.classList.add('sent');
      textEl.textContent = 'Message Sent!';
      iconEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('sent');
        textEl.textContent = 'Send Message';
        iconEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        form.reset();
      }, 3000);
    }, 1000);
  });

  form.querySelectorAll('input, textarea').forEach(inp => {
    inp.addEventListener('input', () => { inp.style.borderColor = ''; });
  });
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
