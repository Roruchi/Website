/**
 * Sumi-e Koi Pond — Vanilla JS Canvas Animation
 * Ported from React reference implementation.
 * Click or tap the pond to drop food pellets; koi swim toward them and eat.
 */
(function () {
  'use strict';

  const CFG = {
    paper:    '#f8f6f1',
    ink:      '#1a1a1a',
    cinnabar: '#c2410c',
    gold:     '#b48a33',
    indigo:   '#1e293b',
    leaf:     'rgba(45, 60, 50, 0.12)',
    rain:     'rgba(26, 26, 26, 0.14)',
    mist:     'rgba(50, 60, 70, 0.06)',
  };

  const lerp    = (a, b, n) => (1 - n) * a + n * b;
  const getDist = (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  function makeFish(x, y, angle, color, accent, size, speed, phase, spineLen, pattern) {
    return { x, y, angle, color, accent, size, speed, phase, pattern,
             spine: Array.from({ length: spineLen }, () => ({ x, y })) };
  }

  function init() {
    const container = document.getElementById('koi-pond-container');
    if (!container) return;

    // SVG ink-bleed displacement filter
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    svg.innerHTML = '<defs><filter id="inkBleed">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" result="noise"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>' +
      '</filter></defs>';
    document.body.appendChild(svg);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'mix-blend-mode:multiply', 'filter:url(#inkBleed)',
      'cursor:crosshair', 'display:block',
    ].join(';');
    container.appendChild(canvas);

    let food    = [];
    let ripples = [];
    let rain    = [];
    let foodId  = 0;

    const fish = [
      makeFish(200, 200, 0,       CFG.ink,    CFG.cinnabar, 38, 1.1, 0,   28, 'kohaku'),
      makeFish(600, 400, Math.PI, CFG.indigo, null,          45, 0.9, 2.5, 32, 'sumi'),
      makeFish(300, 600, 2,       CFG.ink,    CFG.gold,      32, 1.4, 5,   24, 'ogon'),
    ];

    const leaves = Array.from({ length: 5 }, () => ({
      x:     Math.random() * 1200,
      y:     Math.random() * 1200,
      r:     40 + Math.random() * 60,
      angle: Math.random() * Math.PI * 2,
    }));

    function resize() {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function dropFood(e) {
      if (e.type === 'touchstart') e.preventDefault();
      const clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX == null) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      food.push({ x, y, id: foodId++, r: 4 });
      ripples.push({ x, y, r: 0, opacity: 0.6, growth: 1.6, fade: 0.007 });
      ripples.push({ x: x + 5, y: y - 5, r: 0, opacity: 0.2, growth: 1.1, fade: 0.006 });
    }

    var lastPaint = 0;
    function paintWater(e) {
      const clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX == null) return;
      const now = Date.now();
      if (now - lastPaint < 80) return;
      lastPaint = now;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ripples.push({ x, y, r: 0, opacity: 0.22, growth: 0.95, fade: 0.005 });
    }
    container.addEventListener('mousedown', dropFood);
    container.addEventListener('touchstart', dropFood, { passive: false });
    container.addEventListener('mousemove', function(e) {
      if (e.buttons === 1) paintWater(e);
    });
    container.addEventListener('touchmove', function(e) {
      e.preventDefault();
      paintWater(e);
    }, { passive: false });

    const ctx = canvas.getContext('2d');

    function drawFin(x, y, angle, length, width, opacity, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      ctx.fillStyle   = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(length * 0.4, -width,       length,       -width * 0.2, length * 1.1, -width * 0.7);
      ctx.bezierCurveTo(length * 0.8,  0,            length * 0.8,  0,           length * 1.1,  width * 0.7);
      ctx.bezierCurveTo(length,         width * 0.2,  length * 0.4,  width,       0,             0);
      ctx.fill();
      ctx.restore();
    }

    function render() {
      const W = canvas.width, H = canvas.height;
      const t = Date.now();
      const weather = (Math.sin(t / 9000) + 1) * 0.5;
      const rainIntensity = Math.max(0, weather - 0.32) * 1.7;
      const wind = Math.sin(t / 5200) * 0.45;

      ctx.fillStyle = CFG.paper;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(30, 41, 59,' + (0.02 + rainIntensity * 0.1) + ')';
      ctx.fillRect(0, 0, W, H);

      // ── Lily pads ──────────────────────────────────────────────────────────
      leaves.forEach(function(leaf) {
        leaf.x += wind * 0.08;
        leaf.y += Math.sin(t / 4200 + leaf.angle) * 0.04;
        leaf.angle += 0.0008 + wind * 0.0005;
        ctx.save();
        ctx.translate(leaf.x % W, leaf.y % H);
        ctx.rotate(leaf.angle);
        ctx.fillStyle = CFG.leaf;
        ctx.beginPath();
        ctx.arc(0, 0, leaf.r, 0, Math.PI * 1.8);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.restore();
      });

      // ── Wave wash ──────────────────────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.12 + rainIntensity * 0.08;
      ctx.strokeStyle = CFG.mist;
      ctx.lineWidth = 1;
      for (var wy = 40; wy < H; wy += 36) {
        ctx.beginPath();
        for (var wx = 0; wx <= W + 20; wx += 20) {
          var wave = Math.sin((wx * 0.018) + (wy * 0.011) + (t / 1200)) * (2 + rainIntensity * 4);
          if (wx === 0) ctx.moveTo(wx, wy + wave + wind * 2);
          else ctx.lineTo(wx, wy + wave + wind * 2);
        }
        ctx.stroke();
      }
      ctx.restore();

      // ── Rain ───────────────────────────────────────────────────────────────
      var spawns = Math.floor(rainIntensity * 4);
      for (var s = 0; s < spawns; s++) {
        rain.push({
          x: Math.random() * W,
          y: -10 - Math.random() * 50,
          vx: wind * 0.8,
          vy: 4.5 + Math.random() * 2.5 + rainIntensity * 3,
          len: 6 + Math.random() * 8,
          life: 1,
        });
      }

      rain.forEach(function(drop) {
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.life -= 0.02;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.vx * 2, drop.y - drop.len);
        ctx.strokeStyle = CFG.rain;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        if (drop.y > H || drop.life <= 0) {
          ripples.push({
            x: (drop.x % W + W) % W,
            y: H - 1,
            r: 0,
            opacity: 0.2 + rainIntensity * 0.22,
            growth: 0.85 + rainIntensity * 1.2,
            fade: 0.008,
          });
          drop.dead = true;
        }
      });
      rain = rain.filter(function(drop) { return !drop.dead; }).slice(-220);

      // ── Ripples ────────────────────────────────────────────────────────────
      ripples.forEach(function(r) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,' + (r.opacity * 0.15) + ')';
        ctx.lineWidth   = 1;
        ctx.stroke();
        r.r       += r.growth || 1.4;
        r.opacity -= r.fade || 0.007;
      });
      ripples = ripples.filter(function(r) { return r.opacity > 0; });

      // ── Food pellets ───────────────────────────────────────────────────────
      food.forEach(function(f) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        ctx.fill();
      });

      // ── Fish ───────────────────────────────────────────────────────────────
      fish.forEach(function(f) {
        // Seek nearest food
        var target = null, minDist = 600;
        food.forEach(function(fd) {
          var d = getDist(f, fd);
          if (d < minDist) { minDist = d; target = fd; }
        });

        if (target) {
          var diff = Math.atan2(target.y - f.y, target.x - f.x) - f.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff >  Math.PI) diff -= Math.PI * 2;
          f.angle += diff * 0.05;
          f.speed  = lerp(f.speed, 3.8, 0.05);
          if (minDist < 18) {
            var tid = target.id;
            food = food.filter(function(fd) { return fd.id !== tid; });
            ripples.push({ x: f.x, y: f.y, r: 0, opacity: 0.4 });
          }
        } else {
          f.angle += Math.sin(Date.now() / 2400 + f.phase) * 0.015;
          f.angle += wind * 0.01;
          f.speed  = lerp(f.speed, 1.15 + rainIntensity * 0.28, 0.02);
        }

        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed;

        // Wrap around canvas edges
        var b = 200;
        if (f.x < -b)    f.x = W + b;
        if (f.x > W + b) f.x = -b;
        if (f.y < -b)    f.y = H + b;
        if (f.y > H + b) f.y = -b;

        // Serpentine spine physics
        f.spine[0] = { x: f.x, y: f.y };
        for (var i = 1; i < f.spine.length; i++) {
          var p = f.spine[i - 1], c = f.spine[i];
          var a = Math.atan2(c.y - p.y, c.x - p.x);
          f.spine[i] = { x: p.x + Math.cos(a) * 5.5, y: p.y + Math.sin(a) * 5.5 };
        }

        var spine   = f.spine;
        var color   = f.color;
        var accent  = f.accent;
        var size    = f.size;
        var pattern = f.pattern;
        var head    = spine[0];

        // Layer 1: deep shadow
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle   = '#000';
        spine.forEach(function(seg, i) {
          var prog = i / spine.length;
          var w    = (i < 4 ? size * (0.6 + i * 0.1) : size * (1 - prog * 0.9)) * 0.75;
          ctx.beginPath();
          ctx.arc(seg.x + 18, seg.y + 18, w, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Layer 2: pectoral fins
        var pfa = Math.atan2(spine[1].y - head.y, spine[1].x - head.x);
        drawFin(spine[3].x, spine[3].y, pfa + Math.PI / 2.4,  size * 0.8,  size * 0.3, 0.12, color);
        drawFin(spine[3].x, spine[3].y, pfa - Math.PI / 2.4,  size * 0.8, -size * 0.3, 0.12, color);

        // Layer 3: body segments
        ctx.globalAlpha = 0.85;
        spine.forEach(function(seg, i) {
          var prog = i / spine.length;
          var w    = (i < 4 ? size * (0.6 + i * 0.1) : size * (1 - prog * 0.9)) * 0.65;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, w, 0, Math.PI * 2);
          if (pattern === 'kohaku' && i > 3 && i < 14) {
            ctx.fillStyle = i % 4 === 0 ? accent : color;
          } else if (pattern === 'ogon') {
            ctx.fillStyle = i < 10 ? accent : color;
          } else {
            ctx.fillStyle = color;
          }
          ctx.fill();
        });

        // Layer 4: dorsal fin
        ctx.beginPath();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = color;
        ctx.lineWidth   = size * 0.22;
        ctx.lineCap     = 'round';
        ctx.moveTo(spine[4].x, spine[4].y);
        for (var j = 5; j < Math.floor(spine.length * 0.65); j++) {
          ctx.lineTo(spine[j].x, spine[j].y);
        }
        ctx.stroke();

        // Layer 5: eyes
        ctx.globalAlpha = 1.0;
        ctx.fillStyle   = '#fff';
        var ea = Math.atan2(spine[1].y - head.y, spine[1].x - head.x);
        ctx.beginPath();
        ctx.arc(head.x + Math.cos(ea + 0.42) * size * 0.42,
                head.y + Math.sin(ea + 0.42) * size * 0.42, 1.2, 0, Math.PI * 2);
        ctx.arc(head.x + Math.cos(ea - 0.42) * size * 0.42,
                head.y + Math.sin(ea - 0.42) * size * 0.42, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
