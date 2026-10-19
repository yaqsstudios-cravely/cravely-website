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
  function onScrollNav() { if (!nav) return; var y = window.scrollY, on = nav.classList.contains('scrolled'); nav.classList.toggle('scrolled', nav.dataset.always === '1' || (on ? y > 2 : y > 16)); }
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

/* ---- the example post: tap the small photo to swap it with the big one ---- */
(function () {
  var box = document.querySelector('.post-photo'); if (!box) return;
  function swap() {
    var big = box.querySelector('.ph-l.big'), small = box.querySelector('.ph-l.small'); if (!big || !small) return;
    // the old big photo stays underneath as a backdrop while the new one grows over it, so there's never an empty gap
    var old = box.querySelector('.ph-back'); if (old) old.remove();
    var back = document.createElement('img'); back.className = 'ph-back'; back.alt = ''; back.setAttribute('aria-hidden', 'true');
    back.src = big.querySelector('img').currentSrc || big.querySelector('img').src;
    box.insertBefore(back, box.firstChild);
    requestAnimationFrame(function () { requestAnimationFrame(function () { back.classList.add('go'); }); });
    setTimeout(function () { if (back.parentNode) back.remove(); }, 700);
    // the photo that's shrinking stays on top while it travels to the corner
    big.classList.add('lift'); setTimeout(function () { big.classList.remove('lift'); }, 600);
    big.classList.remove('big'); big.classList.add('small'); small.classList.remove('small'); small.classList.add('big');
    big.setAttribute('role', 'button'); big.setAttribute('tabindex', '0'); big.setAttribute('aria-label', 'Swap the two photos');
    small.removeAttribute('role'); small.removeAttribute('tabindex'); small.removeAttribute('aria-label');
  }
  box.addEventListener('click', function (e) { if (e.target.closest('.ph-l.small')) swap(); });
  box.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.ph-l.small')) { e.preventDefault(); swap(); var n = box.querySelector('.ph-l.small'); if (n) n.focus(); } });
})();

/* ---- "Become a tester": a pop-up form that sends the details to the Cravely inbox ---- */
(function () {
  var dlg = document.getElementById('tester'), form = document.getElementById('tester-form');
  if (!dlg || !form || typeof dlg.showModal !== 'function') return; // very old browsers: the buttons scroll to the tester panel instead
  var api = document.body.getAttribute('data-api') || '';
  try { var q = new URLSearchParams(location.search).get('api'); if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) api = q; } catch (e) {}
  var err = form.querySelector('.t-err'), send = form.querySelector('.t-send'), ios = form.querySelector('.t-ios');
  var panes = dlg.querySelectorAll('[data-pane]'), lastFocus = null;
  function pane(name) { panes.forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== name; }); }
  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    if (dlg.open) return;
    dlg.classList.remove('closing'); dlg.showModal();
    var first = form.querySelector('input[name=name]'); if (first && !form.hidden) setTimeout(function () { first.focus(); }, 60);
  }
  function close() {
    if (!dlg.open) return;
    dlg.classList.add('closing');
    setTimeout(function () { dlg.classList.remove('closing'); dlg.close(); }, 200);
  }
  dlg.addEventListener('close', function () {
    if (!dlg.querySelector('[data-pane=done]').hidden) { form.reset(); ios.hidden = true; pane('form'); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) close(); });
  document.querySelectorAll('[data-tester]').forEach(function (b) { b.addEventListener('click', open); });
  if (location.hash === '#tester') open();
  form.addEventListener('change', function (e) { if (e.target.name === 'device') ios.hidden = e.target.value !== 'iphone'; });
  form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });

  function fail(msg, field) {
    err.textContent = msg; err.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }
  function confetti() {
    var box = dlg.querySelector('.t-burst'); if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    box.innerHTML = '';
    var cols = ['#7C3AED', '#FCD34D', '#F472B6', '#34D399', '#60A5FA', '#FB923C'];
    for (var i = 0; i < 34; i++) {
      var c = document.createElement('i'), a = Math.random() * Math.PI - Math.PI, d = 90 + Math.random() * 150;
      c.style.background = cols[i % cols.length];
      c.style.setProperty('--x', Math.round(Math.cos(a) * d * 1.4) + 'px');
      c.style.setProperty('--y', Math.round(Math.sin(a) * d + 120) + 'px');
      c.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
      c.style.animationDelay = Math.random() * .15 + 's';
      box.appendChild(c);
    }
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    var f = form.elements, name = f.name.value.trim(), email = f.email.value.trim();
    if (!name) return fail('Add your name.', f.name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return fail('Enter a valid email address, like you@gmail.com.', f.email);
    if (!f.age13.checked) return fail('Tick the box to confirm you\'re 13 or older.', f.age13);
    var device = form.querySelector('input[name=device]:checked').value;
    send.disabled = true; send.innerHTML = '<span class="spin" aria-hidden="true"></span><span>Sending</span>';
    var body = { name: name, email: email, device: device, heard: f.heard.value, note: f.note.value.trim(), age13: true, website: f.website.value };
    fetch(api + '/v1/testers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error((res.d && res.d.error && res.d.error.message) || 'Something went wrong. Try again.');
        dlg.querySelector('.t-done-msg').textContent = device === 'iphone'
          ? "Cravely is Android first, so we've saved your place. We'll email you as soon as it comes to iPhone."
          : res.d.already ? "You're already signed up. We'll email the invite to " + email + ' soon.'
          : "Thanks, " + name + "! We'll email the invite to " + email + ' soon. Keep an eye on your inbox.';
        pane('done'); confetti();
        var h = dlg.querySelector('.t-done h2'); if (h) h.focus();
      })
      .catch(function (x) {
        var msg = x && x.message && !/fetch|network|load/i.test(x.message) ? x.message : null;
        if (msg) return fail(msg);
        // couldn't reach the server: let them email us instead, with everything filled in
        var link = 'mailto:cravely.support@gmail.com?subject=' + encodeURIComponent('I want to test Cravely') + '&body=' + encodeURIComponent('Name: ' + name + '\nGoogle account email: ' + email + '\nPhone: ' + device + '\n' + (body.note ? 'Message: ' + body.note : ''));
        err.innerHTML = 'We couldn\'t send that just now. <a href="' + link + '">Email us your details instead</a>.'; err.hidden = false;
      })
      .then(function () { send.disabled = false; send.innerHTML = '<span>Send my details</span>'; });
  });
})();
