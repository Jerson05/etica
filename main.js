/* ═══════════════════════════════════════════════════════════════
   BRÚJULA ÉTICA — HUM-010  |  main.js
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   1. NAVEGACIÓN
───────────────────────────────────────────────────────────── */
function goTo(id, el) {
  const target = document.getElementById(id);
  if (!target) return;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 66, behavior: 'smooth' });
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

window.addEventListener('scroll', () => {
  const ids = ['inicio','equipo','manifiesto','podcast','videoreaccion','infografia'];
  const links = document.querySelectorAll('.nav-links a');
  let cur = 'inicio';
  ids.forEach(id => {
    const s = document.getElementById(id);
    if (s && window.pageYOffset >= s.offsetTop - 100) cur = id;
  });
  links.forEach((a, i) => a.classList.toggle('active', ids[i] === cur));
});

/* ─────────────────────────────────────────────────────────────
   2. LIGHTBOX (visor de imágenes en página)
───────────────────────────────────────────────────────────── */
function openLightbox(src, caption) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  img.src = src;
  cap.textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/* Cerrar con clic en el fondo o con Escape */
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ─────────────────────────────────────────────────────────────
   3. FONDO ANIMADO (canvas de red + brújula)
───────────────────────────────────────────────────────────── */
(function () {
  const cv  = document.getElementById('bg-canvas');
  const ctx = cv.getContext('2d');
  let W, H, nodes, lines, compass;

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    init();
  }

  function init() {
    nodes = [];
    const cols = Math.ceil(W / 90) + 1;
    const rows = Math.ceil(H / 90) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.38) {
          nodes.push({
            x: c * 90 + Math.random() * 30 - 15,
            y: r * 90 + Math.random() * 30 - 15,
            r: Math.random() < 0.15 ? 3 : 1.5,
            pulse: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.012
          });
        }
      }
    }
    lines = [];
    nodes.forEach(n => {
      nodes.forEach(m => {
        if (n === m) return;
        const dx = m.x - n.x, dy = m.y - n.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110 && d > 20 && Math.random() < 0.22) {
          lines.push({ n, m, flow: Math.random() * Math.PI * 2, speed: 0.02 + Math.random() * 0.015 });
        }
      });
    });
    compass = { x: W * 0.78, y: H * 0.38, r: Math.min(W, H) * 0.18, angle: 0, speed: 0.001 };
  }

  function drawCompass() {
    const { x, y, r } = compass;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(compass.angle);

    [1, 0.72, 0.44].forEach((s, i) => {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,168,76,${0.06 + i * 0.03})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });

    for (let i = 0; i < 72; i++) {
      const a  = i * (Math.PI * 2 / 72);
      const lg = (i % 18 === 0) ? 0.14 : (i % 6 === 0) ? 0.08 : 0.04;
      const r1 = r * (1 - lg);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r,  Math.sin(a) * r);
      ctx.strokeStyle = (i % 18 === 0) ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.18)';
      ctx.lineWidth   = (i % 18 === 0) ? 1 : 0.5;
      ctx.stroke();
    }

    /* Aguja */
    ctx.beginPath();
    ctx.moveTo(0, r * 0.62);
    ctx.lineTo(-r * 0.055, 0);
    ctx.lineTo(0, -r * 0.62);
    ctx.lineTo(r * 0.055, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(201,168,76,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,0.55)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    /* Punta norte dorada */
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.62);
    ctx.lineTo(-r * 0.04, -r * 0.1);
    ctx.lineTo(0, -r * 0.55);
    ctx.lineTo(r * 0.04, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(201,168,76,0.7)';
    ctx.fill();

    /* Letras cardinales */
    ['N','E','S','W'].forEach((l, i) => {
      const a = i * Math.PI / 2;
      ctx.save();
      ctx.rotate(a);
      ctx.font = `400 ${r * 0.13}px DM Mono,monospace`;
      ctx.fillStyle = 'rgba(201,168,76,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(l, 0, -r * 0.82);
      ctx.restore();
    });

    ctx.restore();
    compass.angle += compass.speed;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    lines.forEach(l => {
      const alpha = 0.04 + 0.03 * Math.sin(l.flow);
      l.flow += l.speed;
      const mx = (l.n.x + l.m.x) / 2;
      ctx.beginPath();
      ctx.moveTo(l.n.x, l.n.y);
      ctx.lineTo(mx,    l.n.y);
      ctx.lineTo(mx,    l.m.y);
      ctx.lineTo(l.m.x, l.m.y);
      ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });

    nodes.forEach(n => {
      n.pulse += n.speed;
      const a = 0.12 + 0.08 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${a + 0.1})`;
      ctx.fill();
    });

    drawCompass();
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ─────────────────────────────────────────────────────────────
   4. REPRODUCTOR DE AUDIO (podcast)
───────────────────────────────────────────────────────────── */
(function () {
  const audio    = document.getElementById('xp-audio');
  const canvas   = document.getElementById('xp-wave');
  const ctx      = canvas.getContext('2d');
  const waveWrap = document.getElementById('xp-wave-wrap');
  const timeEl   = document.getElementById('xp-time');
  const fill     = document.getElementById('xp-prog-fill');
  const track    = document.getElementById('xp-prog-track');
  const btn      = document.getElementById('xp-play-inner');
  const errEl    = document.getElementById('xp-error');
  const discBg   = document.getElementById('xp-disc-bg');

  /* Forma de onda simulada */
  const N = 90;
  let bars = Array.from({ length: N }, (_, i) =>
    Math.max(0.07, Math.abs(Math.sin(i / N * Math.PI * 2.5)) * 0.7 + Math.random() * 0.3)
  );
  for (let p = 0; p < 4; p++)
    for (let i = 1; i < N - 1; i++)
      bars[i] = (bars[i - 1] + bars[i] + bars[i + 1]) / 3;

  let playing = false, discAngle = 0;

  function resizeCanvas() {
    canvas.width  = waveWrap.clientWidth;
    canvas.height = 56;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + (Math.floor(s % 60) < 10 ? '0' : '') + Math.floor(s % 60);
  }

  function drawWave() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const prog = audio.duration ? audio.currentTime / audio.duration : 0;
    const gap  = 2.5;
    const bw   = Math.max(2, (W - (N - 1) * gap) / N);
    bars.forEach((h, i) => {
      const x  = i * (bw + gap);
      const bh = Math.max(3, h * H * 0.88);
      const y  = (H - bh) / 2;
      const f  = i / N;
      if (f < prog) {
        const g = ctx.createLinearGradient(0, y, 0, y + bh);
        g.addColorStop(0,   'rgba(245,228,160,0.95)');
        g.addColorStop(0.5, 'rgba(201,168,76,0.85)');
        g.addColorStop(1,   'rgba(138,96,32,0.7)');
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = f < prog + 0.012 ? 'rgba(232,201,106,0.6)' : 'rgba(201,168,76,0.13)';
      }
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 1.5);
      ctx.fill();
    });
  }

  (function loop() { drawWave(); if (playing) { discAngle += 0.5; discBg.style.transform = `rotate(${discAngle}deg)`; } requestAnimationFrame(loop); })();

  audio.addEventListener('timeupdate', () => {
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    fill.style.width = (p * 100) + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });
  audio.addEventListener('loadedmetadata', () => timeEl.textContent = '0:00 / ' + fmt(audio.duration));
  audio.addEventListener('ended', () => { playing = false; btn.textContent = '▶'; discBg.style.transform = ''; });
  audio.addEventListener('error', () => errEl.style.display = 'block');

  /* Buscar por clic en la forma de onda */
  waveWrap.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = canvas.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  /* Buscar por clic en la barra de progreso */
  track.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = track.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  /* Funciones globales para los botones del HTML */
  window.xpToggle = function () {
    if (audio.paused) {
      audio.play().then(() => { playing = true; btn.textContent = '⏸'; }).catch(() => errEl.style.display = 'block');
    } else {
      audio.pause(); playing = false; btn.textContent = '▶';
    }
  };
  window.xpSkip = function (s) {
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + s));
  };
  window.xpVol = function (v) { audio.volume = v; };
})();

/* ─────────────────────────────────────────────────────────────
   5. REPRODUCTOR DE VIDEO (video-reacción)
───────────────────────────────────────────────────────────── */
(function () {
  const vid       = document.getElementById('vp-video');
  const overlay   = document.getElementById('vp-overlay');
  const playBtn   = document.getElementById('vp-playpause-btn');
  const timeline  = document.getElementById('vp-timeline');
  const tfill     = document.getElementById('vp-timeline-fill');
  const timeText  = document.getElementById('vp-timetext');
  const volSlider = document.getElementById('vp-vol-slider');

  let started = false;

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    return Math.floor(s / 60) + ':' + (Math.floor(s % 60) < 10 ? '0' : '') + Math.floor(s % 60);
  }

  /* Actualiza barra de progreso y tiempo */
  vid.addEventListener('timeupdate', () => {
    const p = vid.duration ? vid.currentTime / vid.duration : 0;
    tfill.style.width = (p * 100) + '%';
    timeline.style.setProperty('--prog', (p * 100) + '%');
    timeText.textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
  });

  vid.addEventListener('loadedmetadata', () => {
    timeText.textContent = '0:00 / ' + fmt(vid.duration);
  });

  /* Fin del video → muestra overlay de nuevo */
  vid.addEventListener('ended', () => {
    overlay.classList.remove('hidden');
    playBtn.textContent = '▶';
    started = false;
  });

  /* Error: abrir en nueva pestaña como fallback */
  vid.addEventListener('error', () => {
    window.open('videos/videoreaccion.mp4', '_blank');
  });

  /* Play / Pause */
  window.vpPlayPause = function () {
    if (!started) {
      vid.play()
        .then(() => { started = true; overlay.classList.add('hidden'); playBtn.textContent = '⏸'; })
        .catch(() => window.open('videos/videoreaccion.mp4', '_blank'));
      return;
    }
    if (vid.paused) {
      vid.play();
      overlay.classList.add('hidden');
      playBtn.textContent = '⏸';
    } else {
      vid.pause();
      overlay.classList.remove('hidden');
      playBtn.textContent = '▶';
    }
  };

  /* Skip ±N segundos */
  window.vpSkipSec = function (s) {
    vid.currentTime = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + s));
  };

  /* Volumen */
  window.vpSetVol = function (v) { vid.volume = parseFloat(v); };

  /* Buscar posición haciendo clic en la barra de tiempo */
  window.vpSeek = function (e) {
    if (!vid.duration) return;
    const r = timeline.getBoundingClientRect();
    vid.currentTime = ((e.clientX - r.left) / r.width) * vid.duration;
  };

  /* Pantalla completa */
  window.vpFullscreen = function () {
    const container = document.getElementById('vp');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    }
  };

  /* Volumen con el slider */
  volSlider.addEventListener('input', () => vpSetVol(volSlider.value));
})();

/* ─────────────────────────────────────────────────────────────
   6. CARRUSEL DE INFOGRAFÍA (resaltado de Capa 1 / Capa 2)
───────────────────────────────────────────────────────────── */
(function () {
  const carouselEl = document.getElementById('infografiaCarousel');
  if (!carouselEl) return;

  const pills = {
    0: document.querySelector('.capa-pill-1'),
    1: document.querySelector('.capa-pill-2')
  };

  function highlightPill(index) {
    Object.values(pills).forEach(p => p && p.classList.remove('capa-pill-active'));
    const target = pills[index];
    if (target) target.classList.add('capa-pill-active');
  }

  function pulseCaption(item) {
    if (!item) return;
    const badge = item.querySelector('.capa-caption-badge');
    if (!badge) return;
    badge.classList.remove('capa-caption-highlight');
    void badge.offsetWidth; /* fuerza reflow para poder reiniciar la animación */
    badge.classList.add('capa-caption-highlight');
  }

  /* Al iniciar el deslizamiento: resalta de inmediato el pill de la capa entrante */
  carouselEl.addEventListener('slide.bs.carousel', e => highlightPill(e.to));

  /* Al terminar el deslizamiento: dispara el pulso de resaltado sobre el texto dentro del carrusel */
  carouselEl.addEventListener('slid.bs.carousel', e => pulseCaption(e.relatedTarget));

  /* Estado inicial (Capa 1 activa) */
  highlightPill(0);
  pulseCaption(carouselEl.querySelector('.carousel-item.active'));
})();