/* ==========================================================================
   TROSHEEN — website behaviour v4.3
   Requires lottie-web (vendor/lottie.min.js or CDN lottie_light 5.12.x) loaded BEFORE this file.
   Every feature is opt-in through a data-attribute, so it can be added to any page/component.
   ========================================================================== */
(function () {
  'use strict';
  var LOTTIE_PATH = window.TROSHEEN_LOTTIE_PATH || '/brand/lottie/';
  var INLINE = window.TROSHEEN_LOTTIE_DATA || null;      // {file.json: data} for offline demos
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Lottie helper ---------- */
  function load(el, file, o) {
    if (!window.lottie || !el) return null;
    o = o || {};
    var data = INLINE && INLINE[file] ? JSON.parse(JSON.stringify(INLINE[file])) : null;
    var a = lottie.loadAnimation({ container: el, renderer: 'svg', loop: !!o.loop, autoplay: !!o.autoplay && !reduce,
      animationData: data || undefined, path: data ? undefined : LOTTIE_PATH + file,
      rendererSettings: { preserveAspectRatio: o.cover ? 'xMidYMid slice' : 'xMidYMid meet' } });
    a.addEventListener('DOMLoaded', function () { if (reduce) a.goToAndStop(a.totalFrames - 1, true); });
    el._lottie = a; return a;
  }
  function playOnce(a) { if (a && !reduce) { a.stop(); a.play(); } }

  /* ---------- 0. Motion v4.1 set-up (runs before observers) ---------- */
  // photos open like a door
  $$('.frame, .polaroid, .product__media').forEach(function (el) { if (!el.closest('[data-reveal]') && !el.hasAttribute('data-reveal') && !el.closest('.hero')) el.setAttribute('data-reveal', 'image'); });
  // making steps reveal individually
  $$('.step').forEach(function (el) { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });
  // hero headline: split into words that rise one by one
  $$('.hero h1').forEach(function (h) { if (h.dataset.split) return; h.dataset.split = 1;
    var words = h.textContent.trim().split(/\s+/); h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>'; }).join(' ');
  });
  // scroll progress bar + hero parallax
  var bar = document.createElement('div'); bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var heroImg = $('.hero__media img');
  var ticking = false;
  function onMove() { ticking = false; var max = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (heroImg && !reduce && scrollY < innerHeight * 1.2) heroImg.style.setProperty('--py', (scrollY * 0.25).toFixed(1) + 'px'); }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onMove); } }, { passive: true }); onMove();

  /* ---------- 1. Reveal on scroll: [data-reveal] [data-ink] [data-draw] [data-lottie data-play="view"] ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target; t.classList.add('is-in');
      if (t._lottie && t.getAttribute('data-play') === 'view') playOnce(t._lottie);
      io.unobserve(t);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }) : null;
  function watch(el) { io ? io.observe(el) : el.classList.add('is-in'); }
  $$('[data-reveal],[data-ink],[data-draw]').forEach(function (el, i) {
    if (el.hasAttribute('data-stagger')) {
      $$(':scope > *', el).forEach(function (c, j) { c.setAttribute('data-reveal', c.getAttribute('data-reveal') || ''); c.style.setProperty('--delay', (j * 110) + 'ms'); watch(c); });
    }
    watch(el);
  });

  /* ---------- 2. Inline ornaments: <span data-ornament="auseklis"> (fetches SVG once) ---------- */
  var ORN = window.TROSHEEN_ORNAMENTS || {};
  $$('[data-ornament]').forEach(function (el) {
    var k = el.getAttribute('data-ornament'); if (ORN[k]) { el.innerHTML = ORN[k]; el.setAttribute('aria-hidden', 'true'); }
  });

  /* ---------- 3. Lottie slots: <div data-lottie="file.json" data-play="loop|view|hover|click|once"> ---------- */
  $$('[data-lottie]').forEach(function (el) {
    var mode = el.getAttribute('data-play') || 'view';
    var a = load(el, el.getAttribute('data-lottie'), { loop: mode === 'loop' || mode === 'ambient', autoplay: mode === 'loop' || mode === 'once' || mode === 'ambient', cover: mode === 'ambient' });
    if (mode === 'view') watch(el);
    if (mode === 'hover') { var h = el.closest('[data-lottie-host]') || el; h.addEventListener('mouseenter', function () { playOnce(a); }); }
  });

  /* ---------- 4. Header: compact on scroll + mobile drawer ---------- */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-compact', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
  var drawer = $('.drawer');
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { drawer.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { drawer.classList.remove('is-open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { drawer && drawer.classList.remove('is-open'); closeLightbox(); } });

  /* ---------- 5. Hero arrive ---------- */
  $$('.hero').forEach(function (h) { requestAnimationFrame(function () { h.classList.add('is-in'); }); });

  /* ---------- 6. Seasons of the courtyard (month based; override with <html data-season="winter">) ---------- */
  var SEASONS = {
    spring: { acc: '#8C9A7B', lv: 'Ceriņi zied pie darbnīcas durvīm.', en: 'Lilacs bloom by the workshop door.' },
    summer: { acc: '#B89150', lv: 'Garas vasaras dienas pagalmā.', en: 'Long summer days in the courtyard.' },
    autumn: { acc: '#8E5636', lv: 'Lapas krīt, darbnīcā smaržo vasks.', en: 'Leaves fall, the workshop smells of wax.' },
    winter: { acc: '#24412F', lv: 'Sniegs krājas pie sētas. Darbnīcā deg sveces.', en: 'Snow gathers by the fence. Candles burn in the workshop.' }
  };
  var m = new Date().getMonth();
  var season = document.documentElement.getAttribute('data-season') || (m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter');
  document.documentElement.setAttribute('data-season', season);
  document.documentElement.style.setProperty('--season', SEASONS[season].acc);
  var lang = (document.documentElement.lang || 'lv').slice(0, 2);
  $$('[data-season-line]').forEach(function (el) { el.textContent = SEASONS[season][lang === 'en' ? 'en' : 'lv']; });
  $$('[data-season-ambient]').forEach(function (el) { load(el, 'trosheen-' + season + '-ambient.json', { loop: true, autoplay: true, cover: true }); });

  /* ---------- 7. Tabs (shop: Gatavie darbi | Pielāgota darbnīca). Deep link: /veikals#darbnica ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(t, push) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
      if (push && t.dataset.hash) history.replaceState(null, '', '#' + t.dataset.hash);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, true); });
      t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n, true); } });
    });
    var fromHash = tabs.filter(function (t) { return t.dataset.hash && location.hash === '#' + t.dataset.hash; })[0];
    select(fromHash || tabs[0], false);
  });

  /* ---------- 8. Chips (filters) & custom-workshop wizard ---------- */
  $$('.chips').forEach(function (g) {
    $$('.chip', g).forEach(function (c) { c.addEventListener('click', function () {
      $$('.chip', g).forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      var f = c.dataset.filter, grid = $(g.dataset.target || '[data-filterable]');
      if (grid) $$('[data-kind]', grid).forEach(function (it) { it.hidden = !(f === 'all' || it.dataset.kind === f); });
    }); });
  });
  $$('[data-wizard]').forEach(function (w) {
    var panes = $$('[data-pane]', w), marks = $$('.wizard__steps li', w), i = 0;
    function show(n) { i = Math.max(0, Math.min(panes.length - 1, n));
      panes.forEach(function (p, k) { p.hidden = k !== i; });
      marks.forEach(function (li, k) { li.classList.toggle('is-current', k === i); li.classList.toggle('is-done', k < i); });
    }
    $$('[data-next]', w).forEach(function (b) { b.addEventListener('click', function () { show(i + 1); }); });
    $$('[data-prev]', w).forEach(function (b) { b.addEventListener('click', function () { show(i - 1); }); });
    show(0);
  });

  /* ---------- 9. Cart pour + wishlist heart ---------- */
  var count = 0, badge = $('[data-cart-count]');
  $$('[data-add-to-cart]').forEach(function (b) { b.addEventListener('click', function () {
    playOnce((b.querySelector('[data-lottie]') || {})._lottie);
    count++; if (badge) { badge.textContent = count; badge.classList.add('is-on'); }
    var label = b.querySelector('[data-label]'); if (label) { var old = label.textContent; label.textContent = b.dataset.added || 'Pievienots grozam'; setTimeout(function () { label.textContent = old; }, 2200); }
  }); });
  $$('[data-wishlist]').forEach(function (b) { b.addEventListener('click', function (e) {
    e.preventDefault(); var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
    var a = (b.querySelector('[data-lottie]') || {})._lottie; if (a) { on ? playOnce(a) : a.goToAndStop(0, true); }
  }); });

  /* ---------- 10. Story: chapter nav highlight + timeline progress ---------- */
  var chapterLinks = $$('.chapter-nav a');
  if (chapterLinks.length && io) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) {
      chapterLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
    } }); }, { rootMargin: '-45% 0px -50% 0px' });
    chapterLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) cio.observe(s); });
  }
  $$('.timeline').forEach(function (tl) {
    if (reduce) return;
    var f = function () { var r = tl.getBoundingClientRect(), vh = innerHeight; var p = Math.min(1, Math.max(0, (vh * .8 - r.top) / r.height)); tl.style.setProperty('--progress', p.toFixed(3)); };
    f(); addEventListener('scroll', f, { passive: true });
  });

  /* ---------- 11. Gallery lightbox ---------- */
  var lb = $('.lightbox');
  function closeLightbox() { if (lb) lb.classList.remove('is-open'); }
  if (lb) {
    $$('[data-lightbox] figure').forEach(function (f) { f.tabIndex = 0; var open = function () { $('img', lb).src = $('img', f).currentSrc || $('img', f).src; $('img', lb).alt = $('img', f).alt; lb.classList.add('is-open'); };
      f.addEventListener('click', open); f.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); }); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('[data-close]')) closeLightbox(); });
  }

  /* ---------- 12. Forms: friendly inline validation + calm success ---------- */
  $$('form[data-friendly]').forEach(function (f) { f.addEventListener('submit', function (e) {
    e.preventDefault(); var ok = true;
    $$('[required]', f).forEach(function (inp) { var err = inp.parentNode.querySelector('.field-error'); var bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
      if (err) err.hidden = !bad; inp.setAttribute('aria-invalid', bad); if (bad) ok = false; });
    if (ok) { var s = f.querySelector('.form-ok'); if (s) { s.classList.add('is-on'); playOnce((s.querySelector('[data-lottie]') || {})._lottie); } f.reset(); }
  }); });

  /* ---------- 13. v4.3: page veil with seal loader (soft page-to-page transition) ---------- */
  if (!reduce) {
    var veil = document.createElement('div'); veil.className = 'page-veil'; veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = '<span class="page-veil__seal"></span>'; document.body.appendChild(veil);
    load(veil.firstChild, 'trosheen-28-loader-seal.json', { loop: true, autoplay: true });
    var lift = function () { veil.classList.remove('is-on'); veil.classList.add('is-off'); };
    if (document.readyState === 'complete') setTimeout(lift, 250); else addEventListener('load', function () { setTimeout(lift, 250); });
    addEventListener('pageshow', function (e) { if (e.persisted) lift(); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href) || href.indexOf('#') > 0 && a.pathname === location.pathname) return;
      e.preventDefault(); veil.classList.remove('is-off'); veil.classList.add('is-on'); setTimeout(function () { location.href = a.href; }, 380);
    });
  }

  /* ---------- 14. v4.3: count-up numbers <span data-count="1995"> ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10), start = end > 1000 ? end - 30 : 0;
    if (reduce || !io) { el.textContent = end; return; }
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; co.unobserve(el);
      var t0 = performance.now(), d = 1400; (function tick(t) { var p = Math.min(1, (t - t0) / d); p = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (end - start) * p); if (p < 1) requestAnimationFrame(tick); })(t0); }); }, { threshold: .6 });
    el.textContent = start; co.observe(el);
  });

  /* ---------- 15. v4.3: Gilt marker words <mark data-mark> ---------- */
  $$('mark[data-mark]').forEach(watch);

  /* ---------- 16. v4.3: magnetic buttons (fine pointers only) ---------- */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('.btn').forEach(function (b) { b.classList.add('is-magnet');
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); var x = (e.clientX - r.left - r.width / 2) * .18, y = (e.clientY - r.top - r.height / 2) * .28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }
})();
