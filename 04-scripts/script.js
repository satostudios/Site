/* ==========================================
   SATO STUDIOS v3.1 — All Animations
   ========================================== */

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
const isFinePointer = window.matchMedia('(pointer:fine)').matches;
const cDot = document.getElementById('cDot');
const cRing = document.getElementById('cRing');

if (isFinePointer && cDot && cRing) {
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cDot.style.left = mx + 'px';
    cDot.style.top = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cRing.style.left = rx + 'px';
    cRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  const hoverEls = document.querySelectorAll('a, button, .tag, .pcard, .chip, .pcard-plan');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cRing.style.width = '52px';
      cRing.style.height = '52px';
      cRing.style.borderColor = 'rgba(200,255,0,.7)';
      cDot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cRing.style.width = '32px';
      cRing.style.height = '32px';
      cRing.style.borderColor = 'rgba(200,255,0,.35)';
      cDot.style.opacity = '1';
    });
  });
}

/* ══════════════════════════════════════
   LIVE CLOCK
══════════════════════════════════════ */
const clockEl = document.getElementById('clock');
function tickClock() {
  if (!clockEl) return;
  const n = new Date();
  const hh = String(n.getHours()).padStart(2, '0');
  const mm = String(n.getMinutes()).padStart(2, '0');
  const ss = String(n.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${hh}:${mm}:${ss}`;
}
tickClock();
setInterval(tickClock, 1000);

/* ══════════════════════════════════════
   HEADER SCROLL
══════════════════════════════════════ */
const hdr = document.getElementById('hdr');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  hdr.classList.toggle('scrolled', y > 50);
  lastY = y;
}, { passive: true });

/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
const burger = document.getElementById('burger');
const mobNav = document.getElementById('mobNav');

if (burger && mobNav) {
  mobNav.removeAttribute('hidden');  // enable CSS-driven collapse

  burger.addEventListener('click', () => {
    const isOpen = mobNav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    mobNav.querySelectorAll('.ml').forEach(l => {
      l.tabIndex = isOpen ? 0 : -1;
    });
  });

  mobNav.querySelectorAll('.ml').forEach(l => {
    l.addEventListener('click', () => {
      mobNav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ══════════════════════════════════════
   SMOOTH SCROLL (wheel + anchor)
══════════════════════════════════════ */
// Only on desktop to not fight mobile native scroll
if (isFinePointer) {
  let cur = window.pageYOffset;
  let tgt = cur;
  let going = false;
  const EASE = 0.085;

  function smoothStep() {
    cur += (tgt - cur) * EASE;
    if (Math.abs(tgt - cur) < 0.4) { cur = tgt; going = false; }
    window.scrollTo(0, cur);
    if (going) requestAnimationFrame(smoothStep);
  }

  window.addEventListener('wheel', e => {
    e.preventDefault();
    tgt = Math.max(0, Math.min(tgt + e.deltaY * 1.1, document.body.scrollHeight - window.innerHeight));
    if (!going) { going = true; requestAnimationFrame(smoothStep); }
  }, { passive: false });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      tgt = t.getBoundingClientRect().top + window.pageYOffset - 72;
      if (!going) { going = true; requestAnimationFrame(smoothStep); }
    });
  });

  const backTop = document.getElementById('backTop');
  if (backTop) {
    backTop.addEventListener('click', () => {
      tgt = 0;
      if (!going) { going = true; requestAnimationFrame(smoothStep); }
    });
  }
} else {
  // Mobile: native anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  const backTop = document.getElementById('backTop');
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════
   PARALLAX HERO ORBS
══════════════════════════════════════ */
const pxSlow = document.querySelector('.px-slow');
const pxMid = document.querySelector('.px-mid');

if (pxSlow && pxMid && isFinePointer) {
  window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    pxSlow.style.transform = `translateY(${y * 0.18}px)`;
    pxMid.style.transform = `translateY(${y * 0.32}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════
   SCROLL REVEAL  (IntersectionObserver)
══════════════════════════════════════ */
const revEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
revEls.forEach(el => revObs.observe(el));

/* ══════════════════════════════════════
   COUNTER ANIMATION
   Targets: [data-count] inside .hero-stats
   and [data-count] inside .pprice b
══════════════════════════════════════ */
function animateCounter(el, target, suffix = '', duration = 900) {
  const start = performance.now();
  const from = 0;
  // ease-out cubic
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (target - from) * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

// Hero stat counters — run once on page load (already visible)
window.addEventListener('load', () => {
  document.querySelectorAll('.sn[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    animateCounter(el, target, suffix, 1100);
  });
});

// Price counters — run when card scrolls into view
const priceCounters = document.querySelectorAll('.pprice b[data-count]');
const priceObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.count, 10), '', 750);
      priceObs.unobserve(el);
    }
  });
}, { threshold: 0.3 });
priceCounters.forEach(el => priceObs.observe(el));

/* ══════════════════════════════════════
   3D TILT CARDS (desktop)
══════════════════════════════════════ */
function init3DTilt(selector, { maxDeg = 6, lift = 6, scale = 1.02 } = {}) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rx = (-y * maxDeg).toFixed(2);
      const ry = (x * maxDeg).toFixed(2);
      card.style.transition = 'transform .1s ease';
      card.style.transform = `perspective(900px) translateY(-${lift}px) scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.boxShadow = `${(-x * 24).toFixed(1)}px ${(18 - y * 12).toFixed(1)}px 40px rgba(0,0,0,.45)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s';
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

if (isFinePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  init3DTilt('.pcard', { maxDeg: 8, lift: 8, scale: 1.03 });
  init3DTilt('.pcard-plan', { maxDeg: 7, lift: 4, scale: 1.02 });
  init3DTilt('.tool-cell', { maxDeg: 6, lift: 4, scale: 1.02 });
  init3DTilt('.test-card', { maxDeg: 6, lift: 4, scale: 1.02 });
}

/* ══════════════════════════════════════
   PLAN CARD HOVER SHIMMER
══════════════════════════════════════ */
document.querySelectorAll('.pcard-plan:not(.dim)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
    card.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, rgba(200,255,0,.06) 0%, transparent 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.backgroundImage = '';
  });
});

/* ══════════════════════════════════════
   STAGGER CHILDREN on reveal
  (for plan-grid and proj-grid)
══════════════════════════════════════ */
function staggerChildren(parent, selector, baseDelay = 0, step = 0.08) {
  if (!parent) return;
  parent.querySelectorAll(selector).forEach((child, i) => {
    child.style.transitionDelay = (baseDelay + i * step) + 's';
  });
}

const planRevObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      staggerChildren(el, '.pcard-plan', 0.05, 0.1);
      staggerChildren(el, '.pcard', 0.05, 0.1);
      el.querySelectorAll('.pcard-plan, .pcard').forEach(c => c.classList.add('in'));
      planRevObs.unobserve(el);
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.plan-grid, .proj-grid').forEach(grid => {
  grid.querySelectorAll('.pcard-plan, .pcard').forEach(c => {
    c.classList.add('reveal');
  });
  planRevObs.observe(grid);
});

/* ══════════════════════════════════════
   HERO TITLE — LETTER SPLIT glitch flash
  (runs once, 0.6s after page load)
══════════════════════════════════════ */
setTimeout(() => {
  const heroTitle = document.querySelector('.hero-display');
  if (!heroTitle) return;
  heroTitle.style.transition = 'filter .08s';
  heroTitle.style.filter = 'blur(2px) brightness(1.4)';
  setTimeout(() => { heroTitle.style.filter = ''; }, 80);
}, 900);

/* ══════════════════════════════════════
   MARQUEE pause on reduced-motion
══════════════════════════════════════ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const track = document.querySelector('.marquee-track');
}