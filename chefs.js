/* Meet the chefs: tap a chef to see them big, with their moods. Works without this script (Chompy shows by default). */
(function () {
  'use strict';
  const CHEFS = {
   "chompy": {
    "name": "Chompy",
    "line": "The cheerful chef who loves to cook and eat!",
    "c": "#6B3FD6",
    "bg": "#ECE6FC",
    "moods": [
     "happy",
     "cooking",
     "excited",
     "thinking",
     "yum",
     "surprised",
     "tired"
    ]
   },
   "noodle": {
    "name": "Noodle",
    "line": "The calm and focused noodle lover.",
    "c": "#1C9356",
    "bg": "#DDF2E5",
    "moods": [
     "happy",
     "slurping",
     "content",
     "surprised",
     "thinking",
     "excited",
     "sleepy"
    ]
   },
   "bao": {
    "name": "Bao",
    "line": "The sweet and kind-hearted foodie.",
    "c": "#D93A78",
    "bg": "#FBE2EB",
    "moods": [
     "happy",
     "love",
     "eating",
     "surprised",
     "thinking",
     "excited",
     "sad"
    ]
   },
   "sizzle": {
    "name": "Sizzle",
    "line": "The energetic chef with a fiery passion for flavour.",
    "c": "#DC5F0C",
    "bg": "#FDEBD5",
    "moods": [
     "cooking",
     "flipping",
     "excited",
     "thinking",
     "happy",
     "surprised",
     "tired"
    ]
   },
   "taco": {
    "name": "Taco",
    "line": "The fun-loving spice master.",
    "c": "#B37A00",
    "bg": "#FBF1CF",
    "moods": [
     "happy",
     "excited",
     "eating",
     "cool",
     "thinking",
     "dancing",
     "surprised"
    ]
   },
   "sprinkle": {
    "name": "Sprinkle",
    "line": "The happy, colourful sweet tooth.",
    "c": "#2474D6",
    "bg": "#DEEBFB",
    "moods": [
     "happy",
     "eating",
     "excited",
     "thinking",
     "surprised",
     "sleepy",
     "waving"
    ]
   },
   "pepperoni": {
    "name": "Pepperoni",
    "line": "The big-hearted pizza fan who always saves you a slice.",
    "c": "#D7322A",
    "bg": "#FBE0DC",
    "moods": []
   },
   "boba": {
    "name": "Boba",
    "line": "The laid-back bubble tea sipper.",
    "c": "#118F82",
    "bg": "#D8F3EE",
    "moods": []
   },
   "maki": {
    "name": "Maki",
    "line": "The neat and tidy sushi perfectionist.",
    "c": "#7149D8",
    "bg": "#EAE3FC",
    "moods": []
   },
   "butters": {
    "name": "Butters",
    "line": "The cosy baker who puts butter on everything.",
    "c": "#A87700",
    "bg": "#FBF0D2",
    "moods": []
   },
   "gulp": {
    "name": "Gulp",
    "line": "The always-hungry burger king. Seconds? Always.",
    "c": "#5536CF",
    "bg": "#E6E0FB",
    "moods": []
   },
   "blaze": {
    "name": "Blaze",
    "line": "The fearless fan of anything spicy.",
    "c": "#CC3329",
    "bg": "#FBDFDA",
    "moods": []
   },
   "scoop": {
    "name": "Scoop",
    "line": "The cool customer on an ice cream adventure.",
    "c": "#168F79",
    "bg": "#D8F3EC",
    "moods": []
   },
   "whisky": {
    "name": "Whiskers",
    "line": "The patient baker who whisks everything by hand.",
    "c": "#7E4FD8",
    "bg": "#EDE4FC",
    "moods": []
   }
  };
  var show = document.getElementById('chef-show'); if (!show) return;
  var big = document.getElementById('chef-big'), name = document.getElementById('chef-name'), line = document.getElementById('chef-line');
  var list = document.getElementById('chef-moods'), soon = document.getElementById('chef-soon');
  var picks = Array.prototype.slice.call(document.querySelectorAll('.chef-pick'));
  var ALT = { chompy: 'holding a wooden spoon and a bowl', noodle: 'with a bowl of noodles and chopsticks', bao: 'holding a basket of bao buns', sizzle: 'with a frying pan', taco: 'holding two tacos', sprinkle: 'holding a pink doughnut', pepperoni: 'holding a slice of pizza', boba: 'holding a bubble tea', maki: 'with a board of sushi', butters: 'with a block of butter', gulp: 'holding a burger', blaze: 'with a bowl of spicy noodles', scoop: 'holding an ice cream cone', whisky: 'with a whisk and a mixing bowl' };
  var label = function (m) { return m === 'yum' ? 'Yum!' : m === 'love' ? 'Love it' : m.charAt(0).toUpperCase() + m.slice(1); };
  function pick(key, fromClick) {
    var c = CHEFS[key]; if (!c) return;
    picks.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.chef === key)); });
    show.style.setProperty('--c', c.c); show.style.setProperty('--bg', c.bg);
    show.classList.remove('swap'); void show.offsetWidth; show.classList.add('swap');
    big.src = 'chefs/' + key + '.webp'; big.alt = c.name + ' ' + (ALT[key] || '');
    name.textContent = c.name; line.textContent = c.line;
    list.setAttribute('aria-label', c.name + "'s moods");
    list.innerHTML = c.moods.map(function (m) { return '<li><figure><img src="chefs/moods/' + key + '-' + m + '.webp" alt="' + c.name + ', ' + label(m).toLowerCase() + '" loading="lazy"><figcaption>' + label(m) + '</figcaption></figure></li>'; }).join('');
    list.hidden = !c.moods.length; soon.hidden = !!c.moods.length;
    if (fromClick) { var r = show.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .6) show.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  }
  picks.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.chef, true); }); });
  // warm the cache for the big pictures so switching is instant
  addEventListener('load', function () { setTimeout(function () { Object.keys(CHEFS).forEach(function (k) { var i = new Image(); i.src = 'chefs/' + k + '.webp'; }); }, 1200); });
})();
