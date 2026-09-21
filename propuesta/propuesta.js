/* OrlandoStudio™ — Propuesta (deck)
   Splash, header con estado activo + contador, scroll controlado (una rueda =
   un slide, con pausa), fondo ambiental reactivo al puntero, luz que sigue al
   mouse, focos de luz en cards, split-text, contadores de precio, parallax,
   tilt, navegación lateral, teclado y menú móvil. Sin dependencias.
   Cada init va envuelto en safe(): si uno falla, el resto sigue. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var deckMQ = window.matchMedia('(min-width: 960px)');

  var splash = document.getElementById('splash');
  var header = document.getElementById('deck-header');
  var burger = document.getElementById('deck-burger');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileClose = document.getElementById('mobile-menu-close');
  var progress = document.getElementById('deck-progress');
  var current = document.getElementById('deck-current');
  var total = document.getElementById('deck-total');

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.deck-nav a[data-slide], .mobile-nav a[data-slide]'));
  var sideDots = [];

  var pad = function (n) { return '' + n; };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function safe(fn, name) {
    try { fn(); } catch (err) { if (window.console) console.warn('[propuesta] ' + name + ' falló:', err); }
  }

  total.textContent = pad(slides.length);

  /* Slides que pertenecen al grupo "Paquetes" en el nav */
  var groupOf = { 'paquete-1': 'paquetes', 'paquete-2': 'paquetes', 'paquete-3': 'paquetes' };

  /* ---------- Splash (doble red: timeout + click) ---------- */
  function finishSplash() {
    if (!splash.classList.contains('is-done')) {
      splash.classList.add('is-done');
      header.classList.add('is-in');
    }
  }
  safe(function () {
    if (reduceMotion) { finishSplash(); return; }
    window.setTimeout(finishSplash, 2600);   // duración de los keyframes del splash
    window.setTimeout(finishSplash, 4500);   // red de seguridad por si el primero no corre
    splash.addEventListener('click', finishSplash);
  }, 'splash');

  /* ---------- Fondo ambiental por slide (decorativo, inyectado) ---------- */
  safe(function () {
    slides.forEach(function (slide) {
      if (slide.querySelector('.ambient')) return; // idempotente
      var amb = document.createElement('div');
      amb.className = 'ambient';
      amb.setAttribute('aria-hidden', 'true');
      amb.innerHTML = '<i class="ambient-grid"></i><i class="ambient-glow ambient-glow--a"></i><i class="ambient-glow ambient-glow--b"></i>';
      slide.insertBefore(amb, slide.firstChild);
      slide.glowA = amb.children[1]; slide.glowB = amb.children[2];
    });
  }, 'ambient');

  /* ---------- Decorados inyectados en cards (sheen, glow, escalera) ---------- */
  safe(function () {
    function inject(sel, cls) {
      $$(sel).forEach(function (el) {
        if (el.querySelector(':scope > .' + cls)) return;
        var i = document.createElement('i'); i.className = cls; i.setAttribute('aria-hidden', 'true');
        el.appendChild(i);
      });
    }
    inject('.pack-meta-cell', 'sheen');
    inject('.pack-list li', 'glow');
    inject('.step', 'glow');
    inject('.step', 'step-riser');
    $$('.step').forEach(function (step, i) {
      if (step.querySelector('.step-ghost')) return;
      var g = document.createElement('i'); g.className = 'step-ghost'; g.setAttribute('aria-hidden', 'true');
      g.textContent = pad(i + 1);
      step.appendChild(g);
    });
  }, 'decor');

  /* ---------- Puntero → --mx/--my globales (glows) + luz que sigue al mouse ---------- */
  safe(function () {
    if (!finePointer) return;
    var light = document.querySelector('.cursor-light');
    if (!light) {
      light = document.createElement('div');
      light.className = 'cursor-light';
      light.setAttribute('aria-hidden', 'true');
      document.body.appendChild(light);
    }
    var tx = .5, ty = .5, cx = .5, cy = .5;      // normalizados (glows de fondo)
    var lx = -9999, ly = -9999, px = -9999, py = -9999; // píxeles (luz)
    var raf = null, seen = false;
    function tick() {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      lx += (px - lx) * .16; ly += (py - ly) * .16;
      // Solo los glows de los slides en pantalla (los demás están congelados).
      // Antes esto era --mx/--my en <html>: cada frame recalculaba el estilo
      // de los 750 nodos de la página y el scroll se trababa con el mouse.
      slides.forEach(function (s) {
        if (s.offscreen) return;
        var a = s.glowA, b = s.glowB;
        if (a) a.style.translate = ((cx - .5) * -60).toFixed(1) + 'px ' + ((cy - .5) * -40).toFixed(1) + 'px';
        if (b) b.style.translate = ((cx - .5) * 40).toFixed(1) + 'px ' + ((cy - .5) * 30).toFixed(1) + 'px';
      });
      light.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';
      if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001 || Math.abs(px - lx) > .3 || Math.abs(py - ly) > .3) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / window.innerWidth; ty = e.clientY / window.innerHeight;
      px = e.clientX; py = e.clientY;
      if (!seen) { seen = true; lx = px; ly = py; light.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { light.classList.remove('is-on'); });
    document.documentElement.addEventListener('pointerenter', function () { if (seen) light.classList.add('is-on'); });
  }, 'pointer');

  /* ---------- Focos de luz locales (--x/--y dentro de cada card) ---------- */
  safe(function () {
    if (!finePointer) return;
    $$('.pack-meta-cell, .pack-list li, .step').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }, 'spotlight');

  /* ---------- Split-text: cada palabra en .w > .wi ---------- */
  safe(function () {
    $$('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone) return;
      var index = 0;
      // Recorre solo nodos de texto para no romper <span class="line"> ni <span class="muted">
      function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var words = child.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();
            words.forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
              var outer = document.createElement('span'); outer.className = 'w';
              var inner = document.createElement('span'); inner.className = 'wi';
              inner.textContent = w;
              inner.style.setProperty('--wd', index++);
              outer.appendChild(inner);
              frag.appendChild(outer);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && !child.classList.contains('w')) {
            walk(child);
          }
        });
      }
      walk(el);
      el.dataset.splitDone = '1';
    });
  }, 'split');

  /* ---------- Índices para animaciones escalonadas ---------- */
  safe(function () {
    slides.forEach(function (slide) {
      $$('[data-reveal]', slide).forEach(function (el, i) {
        el.style.setProperty('--d', (Math.min(i, 10) * 0.07) + 's');
      });
      // Ítems en cascada dentro de su contenedor (heredan el --d del padre)
      $$('.pack-list, .rules, .pack-results ul, .compare tbody, .pack-meta', slide).forEach(function (list) {
        Array.prototype.slice.call(list.children).forEach(function (el, i) { el.style.setProperty('--i', i); });
      });
    });
    $$('.compare i.tick').forEach(function (el, i) { el.style.setProperty('--i', i); });
  }, 'stagger');

  /* ---------- Contadores de precio ---------- */
  var fmt = function (n) { return 'USD ' + n.toLocaleString('es-AR'); };
  function runCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal por slide ----------
     En desktop (deckOn) el cambio de slide es una animación propia del
     scroll: si los elementos se revelan mientras esa animación todavía se
     mueve, se ven dos movimientos superpuestos (el slide entrando + cada
     elemento entrando) y la web se siente pesada. Por eso acá el reveal se
     frena mientras `animating` es true, y quien dispara el reveal real es
     `go()` una vez que el slide ya llegó a destino. En mobile (sin scroll
     controlado) el IntersectionObserver revela apenas entra en pantalla,
     como antes. */
  function revealSlide(slide) {
    if (!slide || slide.classList.contains('is-visible')) return;
    slide.classList.add('is-visible');
    $$('[data-count]', slide).forEach(runCounter);
  }
  safe(function () {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (deckOn && animating) return; // se revela al llegar, no a mitad de camino
        revealSlide(entry.target);
      });
    }, { threshold: 0.05 });
    slides.forEach(function (s) { io.observe(s); });
    // Red de seguridad: pase lo que pase, a los 6 s todo es visible.
    window.setTimeout(function () {
      slides.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight) revealSlide(s); });
    }, 6000);
  }, 'reveal');

  /* ---------- Rendimiento: solo anima lo que se ve ----------
     Cada slide tiene glows, anillos, shimmer, borde cónico, etc. en loop
     infinito. Nueve slides animando a la vez (aunque ocho estén fuera de
     pantalla) dejaban la página en ~25 fps incluso quieta, y el cambio de
     slide se trababa. Acá se pausan con la Web Animations API en vez de una
     clase CSS: cambiar una clase en <html> o en un slide recalculaba el
     estilo de toda la página (60-90 ms en un solo frame); pausar/reanudar
     las animaciones directamente cuesta ~1 ms.
     - Un slide fuera de pantalla (IntersectionObserver con margen, para que
       el siguiente "despierte" un poco antes de entrar) queda congelado.
     - Durante la transición entre slides (animateTo) se congela todo: el
       único movimiento en pantalla es el scroll.
     Solo se pausan animaciones `running`, y solo se reanudan las que pausó
     este código: hacer play() sobre una terminada (wordUp con fill forwards)
     la reiniciaría desde cero. */
  function pauseAnims(root) {
    var list = root.pausedAnims || (root.pausedAnims = []);
    root.getAnimations({ subtree: true }).forEach(function (a) {
      // 'pending' = recién creada y todavía sin su primer frame (pasa en la
      // carga): si no se pausa también, queda corriendo fuera de pantalla.
      if (a.playState === 'running' || a.playState === 'pending') { a.pause(); list.push(a); }
    });
  }
  function resumeAnims(root) {
    var list = root.pausedAnims || [];
    root.pausedAnims = [];
    list.forEach(function (a) { if (a.playState === 'paused') a.play(); });
  }
  function freezeAll() { slides.forEach(function (s) { if (!s.offscreen) pauseAnims(s); }); }
  function thawAll() { slides.forEach(function (s) { if (!s.offscreen) resumeAnims(s); }); }
  safe(function () {
    if (!Element.prototype.getAnimations) return; // navegador viejo: sin gating
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var s = entry.target, off = !entry.isIntersecting;
        if (s.offscreen === off) return;
        s.offscreen = off;
        if (off) pauseAnims(s); else if (!animating) resumeAnims(s);
      });
    }, { rootMargin: '25% 0px 25% 0px', threshold: 0 });
    slides.forEach(function (s) { io.observe(s); });
    // Segunda pasada tras la carga: animaciones que arrancaron después del
    // primer callback (fuentes, splash) en slides que ya estaban fuera.
    window.addEventListener('load', function () {
      window.setTimeout(function () { slides.forEach(function (s) { if (s.offscreen) pauseAnims(s); }); }, 300);
    });
  }, 'offscreen');

  /* ---------- Navegación lateral por puntos ---------- */
  safe(function () {
    if (document.querySelector('.side-dots')) return;
    var wrap = document.createElement('nav');
    wrap.className = 'side-dots';
    wrap.setAttribute('aria-label', 'Ir a un slide');
    slides.forEach(function (s, i) {
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span>' + pad(i + 1) + ' · ' + (s.dataset.title || s.id) + '</span>';
      wrap.appendChild(a);
      sideDots.push(a);
    });
    document.body.appendChild(wrap);
  }, 'sideDots');

  /* ---------- Estado activo (header, contador, barra, puntos) ---------- */
  var activeIndex = -1;
  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    var slide = slides[index];
    var id = slide.id;
    var group = groupOf[id];
    var onLight = slide.classList.contains('slide--light');

    current.textContent = pad(index + 1);
    current.classList.remove('is-flip'); void current.offsetWidth; current.classList.add('is-flip');
    progress.style.transform = 'scaleX(' + ((index + 1) / slides.length) + ')';

    // Exactamente un link activo por nav: el del slide, o "Paquetes" si es uno de los tres.
    navLinks.forEach(function (a) {
      var on = group ? a.dataset.group === group : a.dataset.slide === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    sideDots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
    // En desktop el slide activo cambia a mitad de la transición: los vecinos
    // se pre-renderizan recién al llegar (ver finish() en animateTo), para
    // que ese layout no caiga en medio del scroll.
    if (!deckOn || !animating) preRenderNear(index);
    var sd = document.querySelector('.side-dots');
    if (sd) sd.classList.toggle('on-light', onLight);
    var light = document.querySelector('.cursor-light');
    if (light) light.classList.toggle('on-light', onLight);

    scheduleHash(id);
  }

  /* El hash de la URL se sincroniza recién cuando todo está quieto.
     history.replaceState en medio del scroll costaba 50-100 ms en el hilo
     principal (Chrome captura el estado del documento al tocar el historial)
     y se veía como un tirón justo a mitad de la transición; a 1,5 s del
     cambio de slide ya terminaron el scroll y las animaciones de entrada. */
  var hashTimer = null;
  function scheduleHash(id) {
    if (!history.replaceState) return;
    clearTimeout(hashTimer);
    hashTimer = setTimeout(function () {
      var write = function () { if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id); };
      if (window.requestIdleCallback) requestIdleCallback(write, { timeout: 1000 }); else write();
    }, 1500);
  }

  /* El activo y dos vecinos por lado quedan siempre renderizados (.is-near
     anula content-visibility:auto). Dos y no uno: Chrome "despierta" un
     slide cuando entra en un margen de ~medio viewport, y con un solo vecino
     el de más allá despertaba (layout de ~35 ms) justo a mitad del scroll. */
  function preRenderNear(index) {
    slides.forEach(function (s, i) { s.classList.toggle('is-near', Math.abs(i - index) <= 2); });
  }

  /* ---------- Scroll: slide activo + parallax de decorados ---------- */
  var parallaxEls = $$('.slide-bignum, [data-parallax]');
  var ticking = false;
  function onFrame() {
    ticking = false;
    var vh = window.innerHeight;
    var line = window.scrollY + vh * 0.45;
    var idx = 0;
    for (var i = 0; i < slides.length; i++) if (slides[i].offsetTop <= line) idx = i;
    setActive(idx);

    if (reduceMotion) return;
    parallaxEls.forEach(function (el) {
      var slide = el.closest('.slide');
      if (!slide) return;
      var r = slide.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var factor = parseFloat(el.dataset.parallax) || 0.18;
      var offset = (r.top / vh) * -1 * factor * vh; // positivo al entrar, negativo al salir
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onFrame();

  /* ---------- Scroll controlado (desktop) ----------
     Una rueda = un slide. El desplazamiento lo hace el navegador con
     scrollTo({behavior:'smooth'}): esa animación corre en el hilo del
     compositor, así que avanza a 60 fps aunque el hilo principal esté
     ocupado (antes se hacía scrollTo(y) frame a frame desde JS, y cada
     tarea pesada del main thread —recalcular estilos, pintar un slide nuevo—
     se veía como un tirón en el scroll). Después hay una pausa en la que la
     rueda se ignora: nadie pasa dos slides de un tirón. Si un slide es más
     alto que la pantalla (notebook chica), dentro de él se vuelve al scroll
     nativo hasta tocar su borde. En pantallas <960px o sin JS queda el
     scroll-snap nativo del CSS. */
  var deckOn = false, animating = false, lockedUntil = 0;
  var PAUSE = 150;   // ms de pausa después de llegar

  function animateTo(y, done) {
    var maxY = document.documentElement.scrollHeight - window.innerHeight;
    var target = Math.max(0, Math.min(y, maxY));
    if (Math.abs(window.scrollY - target) < 1) { if (done) done(); return; }
    animating = true;
    // Mientras dura la transición se pausan las demás animaciones: el scroll
    // es lo único que se mueve en pantalla.
    freezeAll();
    var finished = false, still = 0;
    function finish() {
      if (finished) return;
      finished = true;
      window.removeEventListener('scrollend', finish);
      clearInterval(poll); clearTimeout(guard);
      animating = false; lockedUntil = performance.now() + PAUSE;
      thawAll();
      preRenderNear(activeIndex);
      if (done) done();
    }
    // Fin del scroll: `scrollend` donde existe; si no, cuando queda quieto
    // en el destino. El guard evita quedar trabado si nada de eso dispara.
    window.addEventListener('scrollend', finish);
    var poll = setInterval(function () {
      if (Math.abs(window.scrollY - target) < 1) { if (++still >= 2) finish(); } else still = 0;
    }, 50);
    var guard = setTimeout(finish, 1500);
    window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function go(index) {
    var i = Math.max(0, Math.min(slides.length - 1, index));
    if (deckOn) { animateTo(slides[i].offsetTop, function () { revealSlide(slides[i]); }); return; }
    slides[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  safe(function () {
    var acc = 0, accTimer = null;
    function tallSlideRoom(dir) {
      // Si el slide activo excede la pantalla, dejar scroll nativo hasta su borde.
      var s = slides[activeIndex]; if (!s) return false;
      var vh = window.innerHeight, top = s.offsetTop, bottom = top + s.offsetHeight;
      if (s.offsetHeight <= vh + 2) return false;
      if (dir > 0) return window.scrollY + vh < bottom - 2;
      return window.scrollY > top + 2;
    }
    window.addEventListener('wheel', function (e) {
      if (!deckOn || e.ctrlKey) return;
      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir) return;
      if (!animating && tallSlideRoom(dir)) return; // scroll nativo dentro de un slide alto
      e.preventDefault();
      if (animating || performance.now() < lockedUntil) return;
      // Acumular deltas chicos (trackpads) hasta un umbral; reiniciar si se corta el gesto.
      acc += e.deltaY;
      clearTimeout(accTimer); accTimer = setTimeout(function () { acc = 0; }, 120);
      if (Math.abs(acc) < 40) return;
      acc = 0;
      finishSplash();
      go(activeIndex + dir);
    }, { passive: false });

    // Si se arrastra la barra de scroll o se para a mitad de camino, acomodar al slide más cercano.
    var settle = null;
    window.addEventListener('scroll', function () {
      if (!deckOn || animating) return;
      clearTimeout(settle);
      settle = setTimeout(function () {
        if (animating) return;
        var y = window.scrollY, best = 0, bestD = Infinity;
        slides.forEach(function (s, i) { var d = Math.abs(s.offsetTop - y); if (d < bestD) { bestD = d; best = i; } });
        var s = slides[best];
        if (s.offsetHeight > window.innerHeight + 2 && y >= s.offsetTop && y + window.innerHeight <= s.offsetTop + s.offsetHeight) return;
        if (bestD > 2) animateTo(s.offsetTop, function () { revealSlide(s); });
        else revealSlide(s);
      }, 160);
    }, { passive: true });

    function applyMode() {
      deckOn = deckMQ.matches;
      document.documentElement.classList.toggle('js-deck', deckOn);
    }
    if (deckMQ.addEventListener) deckMQ.addEventListener('change', applyMode); else deckMQ.addListener(applyMode);
    applyMode();
  }, 'deckScroll');

  /* ---------- Links internos (#id): animación propia en vez del salto ---------- */
  safe(function () {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      var idx = slides.indexOf(target);
      if (idx < 0) return;
      e.preventDefault();
      finishSplash();
      closeMenu();
      go(idx);
    });
  }, 'anchors');

  /* ---------- Tilt 3D suave (máx. 6°) ---------- */
  safe(function () {
    if (!finePointer) return;
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = 'perspective(1000px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-4px)';
        card.style.transition = 'transform .15s ease-out, box-shadow .5s, border-color .3s';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1), box-shadow .5s, border-color .3s';
        card.style.transform = '';
      });
    });
  }, 'tilt');

  /* ---------- Navegación por teclado ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (deckOn && (animating || performance.now() < lockedUntil)) { e.preventDefault(); return; }
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); finishSplash(); go(activeIndex + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); finishSplash(); go(activeIndex - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });

  /* ---------- Menú móvil (overlay, mismo comportamiento que el home) ---------- */
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  safe(function () {
    if (!burger || !mobileMenu) return;
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  }, 'mobileMenu');

  /* ---------- Carga con hash: arrancar en ese slide ---------- */
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      finishSplash();
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      // Otra vez con todo cargado (fuentes, imágenes, slides ya medidos):
      // si algo cambió de alto, el destino se corrige sin que se note.
      window.addEventListener('load', function () {
        requestAnimationFrame(function () { target.scrollIntoView({ behavior: 'auto', block: 'start' }); });
      });
    }
  }
})();
