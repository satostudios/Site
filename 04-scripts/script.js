/* ==========================================
   SATO STUDIOS v4.0 — Editorial Minimal
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
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    cRing.style.left = rx + 'px';
    cRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  const hoverEls = document.querySelectorAll('a, button, .tag, .pcard, .chip, .pcard-plan, .tool-cell, .test-card, .faq-q');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cRing.style.width = '54px';
      cRing.style.height = '54px';
      cRing.style.borderColor = 'rgba(var(--acc-rgb),.6)';
      cDot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cRing.style.width = '30px';
      cRing.style.height = '30px';
      cRing.style.borderColor = 'rgba(var(--acc-rgb),.3)';
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
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
const burger = document.getElementById('burger');
const mobNav = document.getElementById('mobNav');

if (burger && mobNav) {
  mobNav.removeAttribute('hidden');

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
      tgt = t.getBoundingClientRect().top + window.pageYOffset - 76;
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
   PARALLAX HERO ORBS (subtle)
══════════════════════════════════════ */
const pxSlow = document.querySelector('.px-slow');

if (pxSlow && isFinePointer) {
  window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    pxSlow.style.transform = `translateY(${y * 0.15}px)`;
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
══════════════════════════════════════ */
function animateCounter(el, target, suffix = '', duration = 900) {
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

window.addEventListener('load', () => {
  document.querySelectorAll('.sn[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    animateCounter(el, target, suffix, 1100);
  });
});

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
   MAGNETIC BUTTONS (subtle pull toward cursor)
══════════════════════════════════════ */
if (isFinePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.btn-p, .btn-g, .hdr-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transition = 'transform .15s ease-out';
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════
   CARD LIFT ON HOVER (gentle, no tilt)
══════════════════════════════════════ */
document.querySelectorAll('.pcard-plan:not(.dim)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    card.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, rgba(var(--acc-rgb),.05) 0%, transparent 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.backgroundImage = '';
  });
});

/* ══════════════════════════════════════
   STAGGER CHILDREN on reveal
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
