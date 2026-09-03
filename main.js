/* ==========================================================================
   OrlandoStudio — main.js
   IIFE clásico, sin módulos ES (compatible con file:// y hosting estático).
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Header: fondo al hacer scroll + barra de progreso ---------- */
  function initHeaderScroll() {
    var header = $("#site-header");
    var progressBar = $("#scroll-progress");
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menú mobile ---------- */
  function initNav() {
    var navToggle = $("#nav-toggle");
    var mainNav = $("#main-nav");
    var backdrop = $("#nav-backdrop");

    function openNav() {
      mainNav.classList.add("is-open");
      backdrop.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeNav() {
      mainNav.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    navToggle.addEventListener("click", function () {
      if (mainNav.classList.contains("is-open")) closeNav(); else openNav();
    });
    backdrop.addEventListener("click", closeNav);
    $$("a", mainNav).forEach(function (link) { link.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Scroll suave nativo para anclas (sin Lenis — ver gotcha B.1.4) ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 90;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Gradiente del hero reactivo al mouse ---------- */
  function initMouseGradient() {
    var hero = $(".hero");
    var gradient = $("#hero-gradient");
    if (!hero || !gradient) return;
    if (!fineHover) return; // en touch dejamos el gradiente estático (posición por defecto de la CSS)

    var raf = null;
    function setPos(x, y) {
      var xPct = (x / window.innerWidth) * 100;
      var yPct = (y / window.innerHeight) * 100;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        gradient.style.setProperty("--mx", xPct + "%");
        gradient.style.setProperty("--my", yPct + "%");
      });
    }
    hero.addEventListener("mousemove", function (e) { setPos(e.clientX, e.clientY); });
  }

  /* ---------- Reveals on-scroll — GSAP + ScrollTrigger cuando está disponible.
     El contenido es visible por defecto en el CSS (sin JS no se pierde nada,
     ver regla 13 de la skill): solo si GSAP cargó, lo escondemos y animamos. ---------- */
  function initReveals() {
    if (!(window.gsap && window.ScrollTrigger)) return;
    var els = $$("[data-reveal]");
    els.forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          delay: (i % 3) * 0.05,
          scrollTrigger: { trigger: el, start: "top 92%", once: true }
        }
      );
    });
    // Filas de portfolio: entrada escalonada extra
    var rows = $$(".project-row");
    if (rows.length) {
      gsap.fromTo(rows, { opacity: 0, x: -16 }, {
        opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.06,
        scrollTrigger: { trigger: ".project-list", start: "top 88%", once: true }
      });
    }
  }

  /* ---------- Contadores animados (stats) ---------- */
  function initCountUp() {
    var stats = $$("[data-count-to]");
    if (!stats.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (window.gsap) {
        var proxy = { val: 0 };
        gsap.to(proxy, {
          val: target, duration: 1.6, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(proxy.val) + suffix; }
        });
      } else {
        el.textContent = target + suffix; // sin GSAP: valor final directo
      }
    }

    if (window.gsap && window.ScrollTrigger) {
      stats.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el, start: "top 90%", once: true,
          onEnter: function () { animate(el); }
        });
      });
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
        });
      }, { threshold: 0.3 });
      stats.forEach(function (el) { io.observe(el); });
    } else {
      stats.forEach(animate);
    }
  }

  /* ---------- Vista previa flotante del portfolio (sigue al cursor) ---------- */
  function initProjectPreview() {
    if (!fineHover) return;
    var preview = $("#project-preview");
    var label = $("#project-preview-label");
    var rows = $$(".project-row");
    if (!preview || !rows.length) return;

    var moveX, moveY;
    if (window.gsap) {
      moveX = gsap.quickTo(preview, "left", { duration: 0.5, ease: "power3.out" });
      moveY = gsap.quickTo(preview, "top", { duration: 0.5, ease: "power3.out" });
    }

    function onMove(e) {
      if (moveX && moveY) { moveX(e.clientX); moveY(e.clientY); }
      else { preview.style.left = e.clientX + "px"; preview.style.top = e.clientY + "px"; }
    }

    rows.forEach(function (row) {
      var imgSrc = row.getAttribute("data-img");
      row.addEventListener("mouseover", function (e) {
        if (row.contains(e.relatedTarget)) return;
        preview.classList.add("is-visible");
        if (label) label.textContent = row.getAttribute("data-tag") || "Ver proyecto";
        if (imgSrc) {
          preview.classList.add("has-img");
          preview.style.backgroundImage = "url('" + imgSrc + "')";
        } else {
          preview.classList.remove("has-img");
          preview.style.backgroundImage = "";
        }
        preview.style.left = e.clientX + "px";
        preview.style.top = e.clientY + "px";
      });
      row.addEventListener("mouseout", function (e) {
        if (row.contains(e.relatedTarget)) return;
        preview.classList.remove("is-visible");
      });
      row.addEventListener("mousemove", onMove);
    });
  }

  /* ---------- Filtro de portfolio ---------- */
  function initPortfolioFilter() {
    var filterButtons = $$(".filter-btn");
    var rows = $$(".project-row");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        var filter = btn.getAttribute("data-filter");
        rows.forEach(function (row) {
          var match = filter === "all" || row.getAttribute("data-category") === filter;
          row.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* ---------- Popup a los 7 segundos (una vez por sesión) ---------- */
  function initPopup() {
    var popup = $("#popup-card");
    var popupClose = $("#popup-close");
    var popupCta = $("#popup-cta");
    var KEY = "orlandostudio_popup_dismissed";

    function dismiss() {
      popup.classList.remove("is-visible");
      popup.setAttribute("aria-hidden", "true");
      try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* almacenamiento no disponible */ }
    }
    function show() {
      var dismissed = false;
      try { dismissed = sessionStorage.getItem(KEY) === "1"; } catch (e) { /* no disponible */ }
      if (dismissed) return;
      popup.classList.add("is-visible");
      popup.setAttribute("aria-hidden", "false");
    }
    setTimeout(show, 7000);
    popupClose.addEventListener("click", dismiss);
    popupCta.addEventListener("click", dismiss);
  }

  /* ---------- Formulario de contacto (sin backend) ---------- */
  function initForm() {
    var form = $("#contact-form");
    var formNote = $("#form-note");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) {
        formNote.textContent = "Revisá los campos marcados antes de enviar.";
        formNote.classList.add("is-error");
        return;
      }
      var name = $("#name", form).value.trim();
      formNote.classList.remove("is-error");
      formNote.textContent = "¡Gracias" + (name ? ", " + name.split(" ")[0] : "") + "! Recibimos tu mensaje y te vamos a responder a la brevedad.";
      form.reset();
      /* NOTA: conectar a un endpoint propio, Formspree o EmailJS para recibir los envíos por email. */
    });
  }

  /* ---------- Año actual ---------- */
  function initYear() {
    var el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initHeaderScroll, "initHeaderScroll");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initMouseGradient, "initMouseGradient");
    safe(initPortfolioFilter, "initPortfolioFilter");
    safe(initProjectPreview, "initProjectPreview");
    safe(initPopup, "initPopup");
    safe(initForm, "initForm");
    safe(initYear, "initYear");

    if (window.gsap && window.ScrollTrigger) {
      safe(function () { gsap.registerPlugin(ScrollTrigger); }, "registerScrollTrigger");
    }
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");

    // Failsafe: si algo se queda oculto por cualquier motivo, se revela a los 6s.
    setTimeout(function () {
      $$("[data-reveal]").forEach(function (el) {
        var cs = window.getComputedStyle(el);
        if (parseFloat(cs.opacity) < 1) { el.style.opacity = "1"; el.style.transform = "none"; }
      });
    }, 6000);

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
