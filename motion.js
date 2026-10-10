/* Cravely website motion: scroll reveals, staggered groups, a light hero parallax,
   the forge lighting up, and the header that tracks where you are.
   Content is fully visible without this script, and nothing moves for people who
   have asked their device to reduce motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nav = document.getElementById('nav');

  /* ---- header: hairline and compact height once you scroll ---- */
  function onScrollNav() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8 || nav.dataset.always === '1'); }
  if (nav && nav.classList.contains('scrolled')) nav.dataset.always = '1';
  onScrollNav();
  addEventListener('scroll', onScrollNav, { passive: true });

  /* ---- header: underline the section you're reading ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id]; if (!a) return;
        if (e.isIntersecting) { links.forEach(function (l) { l.removeAttribute('aria-current'); }); a.setAttribute('aria-current', 'true'); }
        else if (a.getAttribute('aria-current')) a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  if (reduce.matches || !('IntersectionObserver' in window)) return; // still page: everything already visible

  root.classList.add('motion');

  /* ---- staggered groups: give each child its place in the queue ---- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--i', Math.min(i, 13)); });
  });

  /* ---- scroll reveals ---- */
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      // reveal on entry, and also anything a jump link skipped past (it's above the screen now)
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      var el = e.target;
      el.classList.add('in');
      revealer.unobserve(el);
      // once the entrance has played, hover effects shouldn't wait for the stagger delay
      if (el.hasAttribute('data-stagger')) setTimeout(function () { el.classList.add('done'); }, 1800);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  var pending = Array.prototype.slice.call(document.querySelectorAll('[data-reveal],[data-stagger],[data-band],.map-card,.forge'));
  pending.forEach(function (el) { revealer.observe(el); });
  // a fast fling or a jump link can carry an element past the screen without the observer
  // ever seeing it on screen; catch those so nothing stays invisible
  var sweeping = false;
  addEventListener('scroll', function () {
    if (sweeping) return; sweeping = true;
    requestAnimationFrame(function () {
      sweeping = false;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add('in'); revealer.unobserve(el);
          if (el.hasAttribute('data-stagger')) setTimeout(function () { el.classList.add('done'); }, 1800);
          return false;
        }
        return true;
      });
    });
  }, { passive: true });

  /* ---- light parallax on a few hero layers (transform only, paused when off screen) ---- */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (layers.length) {
    var ticking = false;
    var visible = new Map();
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible.set(e.target, e.isIntersecting); });
      request();
    });
    layers.forEach(function (el) { watch.observe(el); });
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        if (visible.get(el) === false) return;
        var r = el.getBoundingClientRect();
        var fromCentre = (r.top + r.height / 2) - vh / 2;
        var y = fromCentre * parseFloat(el.dataset.parallax || '0');
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    update();
  }
})();
