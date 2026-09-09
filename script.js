/* ==========================================
   SATO STUDIOS v3.1 — All Animations
   ========================================== */

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
const isFinePointer = window.matchMedia('(pointer:fine)').matches;
const cDot  = document.getElementById('cDot');
const cRing = document.getElementById('cRing');

if (isFinePointer && cDot && cRing) {
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cDot.style.left = mx + 'px';
    cDot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cRing.style.left = rx + 'px';
    cRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  const hoverEls = document.querySelectorAll('a, button, .tag, .pcard, .chip, .pcard-plan');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cRing.style.width  = '52px';
      cRing.style.height = '52px';
      cRing.style.borderColor = 'rgba(200,255,0,.7)';
      cDot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cRing.style.width  = '32px';
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
  const n  = new Date();
  const hh = String(n.getHours()).padStart(2,'0');
  const mm = String(n.getMinutes()).padStart(2,'0');
  const ss = String(n.getSeconds()).padStart(2,'0');
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
const pxMid  = document.querySelector('.px-mid');

if (pxSlow && pxMid && isFinePointer) {
  window.addEventListener('scroll', () => {
    const y = window.pageYOffset;
    pxSlow.style.transform = `translateY(${y * 0.18}px)`;
    pxMid.style.transform  = `translateY(${y * 0.32}px)`;
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
  const from  = 0;
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
   PROJECT CARD 3D TILT (desktop)
══════════════════════════════════════ */
if (isFinePointer) {
  document.querySelectorAll('.pcard').forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '900px';

    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'transform .1s ease, border-color .3s, box-shadow .4s';
      card.style.transform  = `translateY(-8px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), border-color .3s, box-shadow .4s';
      card.style.transform  = '';
    });
  });
}

/* ══════════════════════════════════════
   PLAN CARD HOVER SHIMMER
══════════════════════════════════════ */
document.querySelectorAll('.pcard-plan:not(.dim)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════
   2D PARTICLE CONSTELLATION BACKGROUND
══════════════════════════════════════ */
(function initParticles() {
  if (reduceMotion) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  let w, h, particles;
  const isMobile = window.innerWidth < 700;
  const COUNT = isMobile ? 32 : 68;
  const MAXDIST = isMobile ? 85 : 130;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function makeParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.5 + 0.6
    }));
  }
  resize();
  makeParticles();
  window.addEventListener('resize', () => { resize(); makeParticles(); });

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,255,0,.4)';
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAXDIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(245,243,238,${0.07 * (1 - dist / MAXDIST)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ══════════════════════════════════════
   HERO 3D WIREFRAME (Three.js)
══════════════════════════════════════ */
(function initHero3D() {
  if (typeof THREE === 'undefined' || reduceMotion) return;
  const hero = document.getElementById('hero');
  if (!hero) return;
  if (window.innerWidth < 900) return;

  const mount = document.createElement('div');
  mount.className = 'hero-3d';
  hero.appendChild(mount);

  let width = mount.clientWidth || hero.clientWidth * 0.46;
  let height = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const geo = new THREE.IcosahedronGeometry(2.2, 1);
  const wire = new THREE.WireframeGeometry(geo);
  const mat = new THREE.LineBasicMaterial({ color: 0xc8ff00, transparent: true, opacity: 0.35 });
  const mesh = new THREE.LineSegments(wire, mat);
  scene.add(mesh);

  const geo2 = new THREE.IcosahedronGeometry(1.3, 0);
  const wire2 = new THREE.WireframeGeometry(geo2);
  const mat2 = new THREE.LineBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.18 });
  const mesh2 = new THREE.LineSegments(wire2, mat2);
  scene.add(mesh2);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  function animate() {
    mesh.rotation.x += 0.0022 + mouseY * 0.0018;
    mesh.rotation.y += 0.0032 + mouseX * 0.0018;
    mesh2.rotation.x -= 0.0016;
    mesh2.rotation.y += 0.0026;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    if (window.innerWidth < 900) { mount.style.display = 'none'; return; }
    mount.style.display = '';
    width = mount.clientWidth || hero.clientWidth * 0.46;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
})();

/* ══════════════════════════════════════
   3D MOUSE TILT — extended to more cards
══════════════════════════════════════ */
function apply3DTilt(selector, intensity = 6) {
  if (!isFinePointer) return;
  document.querySelectorAll(selector).forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform .1s ease';
      card.style.transform = `perspective(700px) translateY(-4px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      card.style.transform = '';
    });
  });
}
apply3DTilt('.tool-cell', 5);
apply3DTilt('.test-card', 4);
apply3DTilt('.chip', 8);
apply3DTilt('.pcard-plan:not(.dim)', 4);

/* ══════════════════════════════════════
   MAGNETIC BUTTONS (2D pull toward cursor)
══════════════════════════════════════ */
function magnetize(selector, strength = 0.35, max = 10) {
  if (!isFinePointer) return;
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * strength;
      const dy = (e.clientY - r.top - r.height / 2) * strength;
      const cx = Math.max(-max, Math.min(max, dx));
      const cy = Math.max(-max, Math.min(max, dy));
      btn.style.transform = `translate(${cx}px, ${cy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
magnetize('.btn-p, .btn-g, .hdr-cta, .pbtn.accent');