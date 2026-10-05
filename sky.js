/* The sky over the window is the visitor's own hour.
   Six lights, the same six the app blends between, chosen from local time and
   crossfaded by CSS. No network, no geolocation prompt — the device clock is
   enough, and being wrong by an hour costs nothing here. */

(function () {
  'use strict';

  var LIGHTS = [
    // from  to    top        mid        low        glow       sunFill   starOpacity
    ['night',  22, 5,  '#060C20', '#0B1430', '#131C3A', '#1B2446', '#D8E0F2', 0.55],
    ['dawn',    5, 7,  '#13204A', '#3A3A68', '#7E5570', '#E0906A', '#FFD9A3', 0.18],
    ['morning', 7, 11, '#1B3F79', '#2F6AA8', '#6FA3CA', '#C9DCE8', '#FFF3CE', 0.00],
    ['noon',   11, 16, '#17508F', '#2E7AB8', '#7FB2D6', '#D6E7F0', '#FFF8E0', 0.00],
    ['golden', 16, 19, '#1D3C74', '#4A5A95', '#B47A74', '#F0A765', '#FFD089', 0.00],
    ['dusk',   19, 22, '#0B1430', '#23305C', '#5A4A70', '#C98A6B', '#F2C24E', 0.30]
  ];

  function lightFor(hour) {
    for (var i = 0; i < LIGHTS.length; i++) {
      var l = LIGHTS[i], from = l[1], to = l[2];
      if (from > to) { if (hour >= from || hour < to) return l; }
      else if (hour >= from && hour < to) return l;
    }
    return LIGHTS[5];
  }

  /* Sun rides 06:00 → 18:00, moon 18:00 → 06:00, both on the same arc:
     low at the edges, high in the middle, which is what an arc looks like
     from inside a window. */
  function bodyPosition(minutes) {
    var day = minutes >= 360 && minutes < 1080;
    var t = day
      ? (minutes - 360) / 720
      : ((minutes < 360 ? minutes + 1440 : minutes) - 1080) / 720;
    var x = 6 + t * 88;
    var y = 74 - Math.sin(t * Math.PI) * 56;
    return { x: x, y: y, day: day };
  }

  function paint() {
    var now = new Date();
    var minutes = now.getHours() * 60 + now.getMinutes();
    var light = lightFor(now.getHours());
    var pos = bodyPosition(minutes);
    var s = document.documentElement.style;

    s.setProperty('--sky-top', light[3]);
    s.setProperty('--sky-mid', light[4]);
    s.setProperty('--sky-low', light[5]);
    s.setProperty('--sky-glow', light[6]);
    s.setProperty('--sun-fill', pos.day ? light[7] : '#E6ECFB');
    s.setProperty('--sun-size', pos.day ? '86px' : '58px');
    s.setProperty('--sun-opacity', pos.day ? '0.95' : '0.82');
    s.setProperty('--sun-x', pos.x.toFixed(2) + '%');
    s.setProperty('--sun-y', pos.y.toFixed(2) + '%');
    s.setProperty('--star-opacity', String(light[8]));

    document.documentElement.setAttribute('data-light', light[0]);
  }

  /* Stars are drawn once, seeded so they do not jump between repaints. */
  function stars(el) {
    if (!el) return;
    var seed = 7, n = 48, out = '';
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    for (var i = 0; i < n; i++) {
      var x = (rnd() * 100).toFixed(2);
      var y = (rnd() * 62).toFixed(2);
      var r = (rnd() * 1.1 + 0.4).toFixed(2);
      var o = (rnd() * 0.6 + 0.4).toFixed(2);
      out += '<circle cx="' + x + '%" cy="' + y + '%" r="' + r + '" fill="#FFFFFF" opacity="' + o + '"/>';
    }
    el.innerHTML = out;
  }

  function start() {
    stars(document.querySelector('.stars'));
    paint();
    // The hour turns while the page is open; the app does the same.
    setInterval(paint, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
