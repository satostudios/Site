/* ==========================================
   SATO STUDIOS v5.0 — Swiss Minimal
   ========================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer:fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ══════════════════════════════════════
   LETTER ROLL (botões e links)
══════════════════════════════════════ */
$$('.roll').forEach(el => {
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  el.textContent = '';
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  vis.style.display = 'inline-flex';
  [...text].forEach((ch, i) => {
    const c = document.createElement('span');
    c.className = 'c';
    c.style.setProperty('--i', i);
    c.textContent = ch;
    vis.appendChild(c);
  });
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  el.append(vis, sr);
});

/* ══════════════════════════════════════
   SPLIT HEADINGS (palavra por palavra)
══════════════════════════════════════ */
$$('.split').forEach(el => {
  let wi = 0;
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.style.setProperty('--wi', wi++);
          inner.textContent = p;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.hasAttribute('data-nosplit') && !n.classList.contains('sup') && !n.classList.contains('tm')) {
        walk(n);
      } else if (n.nodeType === 1) {
        // elementos preservados (ex.: "(4)") entram como uma "palavra"
        const w = document.createElement('span');
        w.className = 'w';
        if (n.hasAttribute('data-nosplit')) return;
        n.replaceWith(w);
        const inner = document.createElement('span');
        inner.style.setProperty('--wi', wi++);
        inner.appendChild(n);
        w.appendChild(inner);
      }
    });
  };
  walk(el);
});

/* ══════════════════════════════════════
   WORDMARK FIT (preenche a largura)
══════════════════════════════════════ */
function fitWordmarks() {
  $$('[data-fit]').forEach(el => {
    el.style.fontSize = '100px';
    const cs = getComputedStyle(el);
    const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const kids = [...el.children];
    const widths = kids.map(k => k.getBoundingClientRect().width);
    // no mobile o letreiro fica em duas linhas: a linha mais larga define o tamanho
    const stacked = cs.flexDirection === 'column';
    const used = stacked ? Math.max(...widths) : widths.reduce((s, w) => s + w, 0);
    if (!used) return;
    const gap = !stacked && kids.length > 1 ? avail * 0.035 : 0;
    el.style.fontSize = (100 * (avail - gap) / used) + 'px';
  });
}
fitWordmarks();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmarks);

/* ══════════════════════════════════════
   CLOCK (horário de Brasília)
══════════════════════════════════════ */
const clocks = $$('[data-clock]').map(el => ({ el, sec: el.textContent.trim().length > 5 }));
function tick() {
  const now = new Date();
  clocks.forEach(({ el, sec }) => {
    el.textContent = now.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {})
    });
  });
}
if (clocks.length) { tick(); setInterval(tick, 1000); }

/* ══════════════════════════════════════
   SMOOTH SCROLL (Lenis, com fallback)
══════════════════════════════════════ */
let lenis = null;
if (!reduceMotion && typeof window.Lenis === 'function') {
  lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(t);
  });
});

$$('[data-top]').forEach(b => b.addEventListener('click', () => scrollToTarget(0)));

/* ══════════════════════════════════════
   MENU
══════════════════════════════════════ */
const menu = $('#menu');
const burger = $('#burger');

function openMenu() {
  if (!menu) return;
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true');
  if (lenis) lenis.stop();
  setTimeout(() => { const f = $('.menu-links a', menu); if (f) f.focus({ preventScroll: true }); }, 300);
}

function closeMenu() {
  if (!menu || !menu.classList.contains('open')) return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  if (lenis) lenis.start();
  burger.focus({ preventScroll: true });
}

if (menu && burger) {
  burger.addEventListener('click', openMenu);
  $$('[data-close]', menu).forEach(b => b.addEventListener('click', closeMenu));
  $$('.menu-links a', menu).forEach(a => {
    if (!a.getAttribute('href').startsWith('#')) a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ══════════════════════════════════════
   COUNTERS
══════════════════════════════════════ */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  if (reduceMotion) { el.textContent = target.toLocaleString('pt-BR'); return; }
  const start = performance.now();
  const dur = 1200;
  (function step(now) {
    const k = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('pt-BR');
    if (k < 1) requestAnimationFrame(step);
  })(start);
}

/* ══════════════════════════════════════
   REVEAL
══════════════════════════════════════ */
function startReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('.count', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .split, [data-chat]').forEach(el => io.observe(el));
  const wm = $('.hero .wordmark');
  if (wm) requestAnimationFrame(() => wm.classList.add('in'));
  const ftrWm = $('.ftr .wordmark');
  if (ftrWm) io.observe(ftrWm);
}

/* ══════════════════════════════════════
   PRELOADER
══════════════════════════════════════ */
const loader = $('#loader');
if (loader && !document.documentElement.classList.contains('no-loader')) {
  if (lenis) lenis.stop();
  window.scrollTo(0, 0);
  const cnt = $('#loaderCount');
  const t0 = performance.now();
  const dur = 1300;
  (function step(now) {
    const k = Math.min((now - t0) / dur, 1);
    cnt.textContent = String(Math.round(100 * (1 - Math.pow(1 - k, 2)))).padStart(3, '0');
    if (k < 1) return requestAnimationFrame(step);
    loader.classList.add('done');
    try { sessionStorage.setItem('sato-loaded', '1'); } catch (e) { }
    if (lenis) lenis.start();
    setTimeout(startReveal, 350);
    setTimeout(() => loader.remove(), 1200);
  })(t0);
} else {
  if (loader) loader.remove();
  startReveal();
}

/* ══════════════════════════════════════
   SCROLL-DRIVEN EFFECTS
══════════════════════════════════════ */
const domes = $$('.dome').map(d => d.parentElement);
const reel = $('[data-reel]');
const reelSticky = reel ? $('.reel-sticky', reel) : null;
const reelCols = reel ? $$('.reel-col', reel) : [];
const vision = $('[data-vision]');
const visionSticky = vision ? $('.vision-sticky', vision) : null;
const vLines = vision ? $$('.vl', vision) : [];
const vNum = vision ? $('[data-vnum]', vision) : null;
const showreel = $('[data-showreel]');
const showreelSticky = showreel ? $('.showreel-sticky', showreel) : null;
const testi = $('[data-testi]');
const testiSticky = testi ? $('.testi-sticky', testi) : null;
const quotes = testi ? $$('.quote', testi) : [];
const qNums = testi ? $$('.q-nums span', testi) : [];
const progEls = $$('[data-progress]');
const hdr = $('#hdr');
const narrow = window.matchMedia('(max-width: 900px)');

let vh = window.innerHeight;
let ticking = false;
let lastQuote = -1;
let lastY = window.scrollY;

// usa a altura do bloco "sticky" (100svh), que não muda quando a barra do navegador mobile aparece/some
const stickyProgress = (r, sticky) => clamp(-r.top / Math.max(1, r.height - (sticky ? sticky.offsetHeight : vh)));

// no mobile o cabeçalho some ao rolar para baixo e volta ao rolar para cima
function updateHeader() {
  if (!hdr) return;
  const y = window.scrollY;
  const menuOpen = menu && menu.classList.contains('open');
  if (!narrow.matches || y < 120 || menuOpen) {
    hdr.classList.remove('is-hidden');
    lastY = y;
    return;
  }
  if (Math.abs(y - lastY) < 8) return;
  hdr.classList.toggle('is-hidden', y > lastY);
  lastY = y;
}
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function update() {
  ticking = false;
  updateHeader();

  domes.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top > vh * 1.2 || top < -vh) return;
    // cresce enquanto a seção entra e achata ao chegar no topo
    const enter = clamp((vh - top) / (vh * 0.22));
    const flat = clamp((top - vh * 0.08) / (vh * 0.7));
    const k = enter * (flat * flat * (3 - 2 * flat));
    sec.style.setProperty('--k', k.toFixed(4));
  });

  if (reel) {
    const r = reel.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      reel.style.setProperty('--open', clamp(r.top / vh).toFixed(4));
      const p = clamp((vh - r.top) / r.height);
      const sh = reelSticky.offsetHeight;
      reelCols.forEach(col => {
        const travel = Math.max(0, col.offsetHeight - sh);
        const y = col.dataset.dir === 'down' ? -(1 - p) * travel : -p * travel;
        col.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    }
  }

  if (vision) {
    const r = vision.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = stickyProgress(r, visionSticky);
      const n = vLines.length;
      const v = p * (n + 0.4);
      vLines.forEach((l, i) => l.style.setProperty('--o', clamp(v - i).toFixed(3)));
      vision.style.setProperty('--p', p.toFixed(4));
      if (vNum) vNum.textContent = String(clamp(Math.ceil(v), 1, n)).padStart(2, '0');
    }
  }

  if (showreel) {
    const r = showreel.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = stickyProgress(r, showreelSticky);
      showreel.style.setProperty('--open', easeInOut(clamp(p / 0.75)).toFixed(4));
    }
  }

  if (testi && quotes.length) {
    const r = testi.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = stickyProgress(r, testiSticky);
      const idx = Math.min(quotes.length - 1, Math.floor(p * quotes.length));
      if (idx !== lastQuote) {
        lastQuote = idx;
        quotes.forEach((q, i) => {
          q.classList.toggle('on', i === idx);
          q.classList.toggle('past', i < idx);
        });
        qNums.forEach((s, i) => s.classList.toggle('on', i === idx));
      }
    }
  }

  progEls.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4));
  });
}

function requestUpdate() {
  if (!ticking) { ticking = true; requestAnimationFrame(update); }
}

window.addEventListener('scroll', requestUpdate, { passive: true });
let lastW = window.innerWidth;
window.addEventListener('resize', () => {
  vh = window.innerHeight;
  // a barra de endereço do celular dispara resize só na altura: não precisa refazer o letreiro
  if (window.innerWidth !== lastW) { lastW = window.innerWidth; fitWordmarks(); }
  requestUpdate();
});
window.addEventListener('load', requestUpdate);
update();

/* ══════════════════════════════════════
   SHOWREEL VIDEO (carrega só quando perto)
══════════════════════════════════════ */
if (showreel) {
  const video = $('video', showreel);
  const conn = navigator.connection || {};
  // economia de dados / conexão lenta: fica só a imagem de capa
  const lite = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  video.muted = true;

  if (!lite) {
    const near = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      video.src = video.dataset.src;
      video.load();
      near.disconnect();
    }, { rootMargin: narrow.matches ? '300px 0px' : '800px 0px' });
    near.observe(showreel);
  }

  const vis = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && video.src && !reduceMotion) video.play().catch(() => { });
    else video.pause();
  }, { threshold: 0.05 });
  vis.observe(showreel);
}

/* ══════════════════════════════════════
   SERVICES — imagem que segue o cursor
══════════════════════════════════════ */
const svcList = $('[data-svc]');
const svcFloat = $('#svcFloat');
if (svcList && svcFloat && finePointer && !reduceMotion) {
  const items = $$('.svc', svcList);
  const imgs = items.map(li => {
    const img = document.createElement('img');
    img.src = li.dataset.img;
    img.alt = '';
    img.loading = 'lazy';
    svcFloat.appendChild(img);
    return img;
  });
  let mx = 0, my = 0, fx = 0, fy = 0, running = false;
  const follow = () => {
    fx += (mx - fx) * 0.14;
    fy += (my - fy) * 0.14;
    svcFloat.style.left = fx + 'px';
    svcFloat.style.top = fy + 'px';
    if (running) requestAnimationFrame(follow);
  };
  items.forEach((li, i) => {
    li.addEventListener('mouseenter', e => {
      imgs.forEach((im, j) => im.classList.toggle('on', i === j));
      if (!running) { fx = mx = e.clientX; fy = my = e.clientY; running = true; follow(); }
      svcFloat.classList.add('show');
    });
  });
  svcList.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  svcList.addEventListener('mouseleave', () => {
    svcFloat.classList.remove('show');
    setTimeout(() => { if (!svcFloat.classList.contains('show')) running = false; }, 400);
  });
}

/* ══════════════════════════════════════
   CURSOR LABEL ("Ampliar", no portfólio)
══════════════════════════════════════ */
const cursor = $('#cursor');
if (cursor && finePointer && !reduceMotion) {
  document.addEventListener('mousemove', e => {
    cursor.style.setProperty('--x', e.clientX + 'px');
    cursor.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.textContent = el.dataset.cursor; cursor.classList.add('show'); });
    el.addEventListener('mouseleave', () => cursor.classList.remove('show'));
  });
}

/* ══════════════════════════════════════
   FAQ
══════════════════════════════════════ */
$$('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    $$('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).classList.remove('open');
    });
    if (!open) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls')).classList.add('open');
    }
  });
});

/* ══════════════════════════════════════
   PORTFÓLIO — filtros + lightbox
══════════════════════════════════════ */
const gallery = $('#gallery');
if (gallery) {
  const items = $$('.gitem', gallery);
  const ftags = $$('.ftag');

  ftags.forEach(btn => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? items.length : items.filter(it => it.dataset.cat === f).length;
    const small = $('small', btn);
    if (small) small.textContent = `(${n})`;

    btn.addEventListener('click', () => {
      ftags.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
      items.forEach(it => { it.hidden = !(f === 'all' || it.dataset.cat === f); });
      requestUpdate();
      if (lenis) lenis.resize();
    });
  });

  const modal = $('#modal');
  const mImg = $('#modalImg');
  const mTitle = $('#modalTitle');
  const mCount = $('#modalCounter');
  let cur = 0;
  const visible = () => items.filter(it => !it.hidden);

  function show(i) {
    const list = visible();
    cur = (i + list.length) % list.length;
    const it = list[cur];
    const img = $('img', it);
    mImg.style.opacity = '0';
    setTimeout(() => {
      mImg.src = img.currentSrc || img.src;
      mImg.alt = img.alt;
      mImg.onload = () => { mImg.style.opacity = '1'; };
      if (mImg.complete) mImg.style.opacity = '1';
    }, 150);
    mTitle.textContent = it.dataset.title || img.alt;
    mCount.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
  }

  function openModal(it) {
    show(visible().indexOf(it));
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    setTimeout(() => $('#modalClose').focus({ preventScroll: true }), 50);
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start(); else document.body.style.overflow = '';
    const list = visible();
    if (list[cur]) list[cur].focus({ preventScroll: true });
  }

  items.forEach(it => {
    it.addEventListener('click', () => openModal(it));
    it.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(it); }
    });
  });

  $('#modalClose').addEventListener('click', closeModal);
  $('#modalPrev').addEventListener('click', () => show(cur - 1));
  $('#modalNext').addEventListener('click', () => show(cur + 1));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  let tx = 0;
  modal.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
}
