/* ==========================================================================
   TROSHEEN — website behaviour (brand book v3.1)
   Needs lottie-web (light build is enough):
   <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js" defer></script>
   Then: <script src="/js/trosheen.js" defer></script>
   Set the folder that holds the .json files below (LOTTIE_PATH).
   ========================================================================== */
(function () {
  'use strict';
  var LOTTIE_PATH = window.TROSHEEN_LOTTIE_PATH || '/lottie/';  // folder with all Trosheen .json files
  var INLINE = window.TROSHEEN_LOTTIE_DATA || null;             // optional {file: json} (offline demos)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- helpers ---------- */
  function load(el, file, opts) {
    if (!window.lottie || !el) return null;
    opts = opts || {};
    var src = INLINE && INLINE[file] ? { animationData: JSON.parse(JSON.stringify(INLINE[file])) } : { path: LOTTIE_PATH + file };
    var a = lottie.loadAnimation({
      container: el, renderer: 'svg', animationData: src.animationData, path: src.path,
      loop: !!opts.loop, autoplay: !!opts.autoplay && !reduce,
      rendererSettings: { preserveAspectRatio: opts.cover ? 'xMidYMid slice' : 'xMidYMid meet' }
    });
    if (reduce) a.addEventListener('DOMLoaded', function () { a.goToAndStop(a.totalFrames - 1, true); });
    return a;
  }
  function whenVisible(el, cb, threshold) {
    if (!hasIO || reduce) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cb(); io.disconnect(); } });
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  }
  function playOnce(a) { if (!a) return; reduce ? a.goToAndStop(a.totalFrames - 1, true) : a.goToAndPlay(0, true); }
  window.Trosheen = { load: load, playOnce: playOnce };

  /* ---------- 1. Header shrinks on scroll ---------- */
  var header = document.querySelector('.tr-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---------- 2. Scroll reveal (headlines, images) ---------- */
  document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
    el.style.transitionDelay = ((+el.getAttribute('data-reveal') || 0) * 80) + 'ms';
    whenVisible(el, function () { el.classList.add('is-visible'); }, 0.2);
  });

  /* ---------- 3. Botanical line art draws on scroll ---------- */
  document.querySelectorAll('.tr-botanical').forEach(function (svg) {
    svg.querySelectorAll('path').forEach(function (p, i) { p.style.transitionDelay = (i * 45) + 'ms'; });
    whenVisible(svg, function () { svg.classList.add('is-drawn'); });
  });

  /* ---------- 4. Seasons of the courtyard ---------- */
  var m = new Date().getMonth();
  var season = document.documentElement.getAttribute('data-season') ||          // allow manual override
    (m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter');
  document.documentElement.setAttribute('data-season', season);
  var amb = document.querySelector('.tr-season-ambient');
  if (amb && !reduce) {
    var ambA = load(amb, 'trosheen-' + season + '-ambient.json', { loop: true, autoplay: true, cover: true });
    if (ambA && hasIO) new IntersectionObserver(function (es) { es[0].isIntersecting ? ambA.play() : ambA.pause(); }).observe(amb);
  }

  /* ---------- 5. Lottie slots: <div data-lottie="file.json" data-play="..."> ----------
     data-play: "loop"     → loops (loader, candle, ripple, empty shop)
                "view"     → plays once when scrolled into view (signature, 404, success)
                "hover"    → plays on hover of the closest [data-lottie-host] (category tiles)
                "manual"   → you trigger it: Trosheen.playOnce(el._lottie)                    */
  document.querySelectorAll('[data-lottie]').forEach(function (el) {
    var mode = el.getAttribute('data-play') || 'view';
    var a = load(el, el.getAttribute('data-lottie'), { loop: mode === 'loop', autoplay: mode === 'loop' });
    el._lottie = a;
    if (!a) return;
    if (mode === 'view') whenVisible(el, function () {
      if (a.isLoaded) playOnce(a); else a.addEventListener('DOMLoaded', function () { playOnce(a); });
    });
    if (mode === 'hover') {
      var host = el.closest('[data-lottie-host]') || el;
      host.addEventListener('mouseenter', function () { if (!reduce) { a.setDirection(1); a.play(); } });
      host.addEventListener('mouseleave', function () { if (!reduce) { a.setDirection(-1); a.play(); } });
    }
  });

  /* ---------- 6. Add to cart: <button data-add-to-cart> with a [data-lottie] inside ---------- */
  document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var slot = btn.querySelector('[data-lottie]'); if (slot) playOnce(slot._lottie);
    });
  });

  /* ---------- 7. Wishlist toggle: <button data-wishlist aria-pressed="false"> ---------- */
  document.querySelectorAll('[data-wishlist]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      var a = (btn.querySelector('[data-lottie]') || {})._lottie; if (!a) return;
      if (reduce) { a.goToAndStop(on ? a.totalFrames - 1 : 0, true); return; }
      a.setDirection(on ? 1 : -1); on ? a.goToAndPlay(0, true) : a.play();
    });
  });
})();
