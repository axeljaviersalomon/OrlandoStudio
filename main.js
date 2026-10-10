(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Forzar inicio en el top (evita que el navegador restaure el scroll
     de una visita anterior o de la cache bfcache al entrar al sitio).
     --------------------------------------------------------------------- */

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function forceScrollTop() {
    if (!location.hash && window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }

  forceScrollTop();
  window.addEventListener("pageshow", function (e) {
    if (!location.hash && (e.persisted || window.scrollY > 0)) {
      window.scrollTo(0, 0);
    }
  });

  /* El navegador interno de WhatsApp (y otros in-app browsers) desplaza la
     página unos pixeles DESPUES de que este script corre, una vez termina
     de animar su propia barra superior. Reintentamos varias veces durante
     el primer segundo para forzar el top incluso en ese caso. */
  window.addEventListener("load", forceScrollTop);
  [0, 50, 150, 300, 600, 1000].forEach(function (delay) {
    setTimeout(forceScrollTop, delay);
  });

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* Los proyectos del portfolio y las preguntas del FAQ viven en el HTML de
     index.html (no acá), para que se indexen sin depender de JS. */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------
     Dock flotante + volver arriba
     --------------------------------------------------------------------- */

  var dock = $("#floating-dock");
  var backToTop = $("#back-to-top");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (dock) {
      var show = window.scrollY > window.innerHeight * 0.9 && pct < 0.94;
      dock.classList.toggle("is-visible", show);
    }
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Reveals en scroll (IntersectionObserver)
     --------------------------------------------------------------------- */

  if ("IntersectionObserver" in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    $all("[data-reveal]").forEach(function (el) { revealObserver.observe(el); });
  } else {
    $all("[data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------------
     Línea de tiempo — Proceso
     Sin animación: la línea y los puntos ya están completos en el HTML/CSS
     (progressive enhancement). Con JS, se resetean a 0 y se "dibujan" de
     nuevo a medida que el bloque entra en pantalla, calculando el progreso
     con getBoundingClientRect en cada scroll (sin dependencias externas).
     --------------------------------------------------------------------- */

  var timelineWrap = $(".process-timeline-wrap");
  var timelineProgress = $(".process-timeline-progress", timelineWrap);
  var timelineSteps = $all(".process-step", timelineWrap);

  if (timelineWrap && timelineProgress && timelineSteps.length) {
    if (reducedMotion) {
      timelineSteps.forEach(function (step) { step.classList.add("is-lit"); });
    } else {
      timelineWrap.classList.add("has-timeline-anim");

      var updateTimeline = function () {
        var rect = timelineWrap.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = vh * 0.8;
        var span = rect.height + start - vh * 0.25;
        var pct = span > 0 ? Math.max(0, Math.min(1, (start - rect.top) / span)) : 0;
        timelineProgress.style.transform = "scaleY(" + pct + ")";

        timelineSteps.forEach(function (step) {
          var lit = step.getBoundingClientRect().top < vh * 0.78;
          step.classList.toggle("is-lit", lit);
        });
      };

      window.addEventListener("scroll", updateTimeline, { passive: true });
      window.addEventListener("resize", updateTimeline);
      updateTimeline();
    }
  }

  /* ---------------------------------------------------------------------
     Foco atrapado dentro de un diálogo abierto (modal, menú, lightbox):
     Tab y Shift+Tab ciclan solo entre sus elementos enfocables.
     --------------------------------------------------------------------- */

  function trapFocus(container, e) {
    if (e.key !== "Tab") return;
    var focusables = $all('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------------------
     Nav hamburguesa (mobile)
     --------------------------------------------------------------------- */

  var navToggle = $("#nav-toggle");
  var mobileMenu = $("#mobile-menu");
  var mobileMenuClose = $("#mobile-menu-close");
  if (navToggle && mobileMenu) {
    var menuCloseTimer = null;
    var closeMenu = function () {
      if (!mobileMenu.classList.contains("is-open")) return;
      window.clearTimeout(menuCloseTimer);
      mobileMenu.classList.remove("is-open");
      mobileMenu.classList.add("is-closing");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuCloseTimer = window.setTimeout(function () {
        mobileMenu.classList.remove("is-closing");
      }, 500);
    };
    navToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) {
        closeMenu();
        return;
      }
      window.clearTimeout(menuCloseTimer);
      mobileMenu.classList.remove("is-closing");
      mobileMenu.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (mobileMenuClose) mobileMenuClose.focus();
    });
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", function () {
        closeMenu();
        navToggle.focus();
      });
    }
    $all("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (!mobileMenu.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeMenu();
        navToggle.focus();
      } else {
        trapFocus(mobileMenu, e);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Portfolio: filtros + filas + preview flotante
     --------------------------------------------------------------------- */

  var worksRows = $("#works-rows");
  var rows = worksRows ? $all(".work-row", worksRows) : [];
  var filters = $all(".filter-pill");
  var currentFilter = "all";
  var preview = $("#work-preview");
  var previewImg = $("#work-preview-img");
  var loadMoreWrap = $("#works-load-more-wrap");
  var loadMoreBtn = $("#works-load-more");
  var desktopMq = window.matchMedia("(min-width: 901px)");
  var visibleCount = worksPageSize();

  function worksPageSize() {
    return desktopMq.matches ? 5 : 4;
  }

  /* Las filas ya están en el HTML: acá solo se muestran u ocultan según el
     filtro activo y cuántas "páginas" se cargaron. */
  function renderRows() {
    if (!worksRows) return;
    var matching = rows.filter(function (row) {
      return currentFilter === "all" || row.dataset.cat === currentFilter;
    });
    rows.forEach(function (row) { row.hidden = true; });
    matching.slice(0, visibleCount).forEach(function (row) { row.hidden = false; });
    if (loadMoreWrap) loadMoreWrap.classList.toggle("is-hidden", visibleCount >= matching.length);
  }

  if (!isCoarsePointer && preview && previewImg && worksRows) {
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        previewImg.src = row.dataset.img || "";
        previewImg.alt = "";
        preview.classList.add("is-visible");
      });
      row.addEventListener("mousemove", function (e) {
        preview.style.left = e.clientX + "px";
        preview.style.top = e.clientY + "px";
      });
    });
    worksRows.addEventListener("mouseleave", function () {
      preview.classList.remove("is-visible");
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.dataset.value;
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      visibleCount = worksPageSize();
      renderRows();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      var firstNew = visibleCount;
      visibleCount += worksPageSize();
      renderRows();
      /* El foco pasa a la primera fila nueva, así el teclado no vuelve al
         principio de la lista. */
      var shown = rows.filter(function (row) { return !row.hidden; });
      if (shown[firstNew]) shown[firstNew].focus();
    });
  }

  if (desktopMq.addEventListener) {
    desktopMq.addEventListener("change", function () {
      visibleCount = worksPageSize();
      renderRows();
    });
  }

  renderRows();

  /* ---------------------------------------------------------------------
     FAQ acordeón (el markup está en index.html; se abre de a una)
     --------------------------------------------------------------------- */

  var faqItems = $all(".faq-item");
  faqItems.forEach(function (item) {
    var btn = $(".faq-question", item);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        var isOpen = other === item && willOpen;
        other.classList.toggle("is-open", isOpen);
        $(".faq-question", other).setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  });

  /* ---------------------------------------------------------------------
     Brief (formulario del popup "Empezar proyecto")
     --------------------------------------------------------------------- */

  var BUDGET_OPTIONS = [
    { value: "750-1200", label: "750 a 1.200 USD" },
    { value: "1200-1800", label: "1.200 a 1.800 USD" },
    { value: "1800-2900", label: "1.800 a 2.900 USD" },
    { value: "3000+", label: "Más de 3.000 USD" }
  ];

  function renderBriefFields(container) {
    if (!container) return;
    var budgetHtml = BUDGET_OPTIONS.map(function (opt) {
      return (
        '<label class="brief-budget-option">' +
          '<input type="radio" name="budget" value="' + opt.value + '">' +
          '<span class="brief-budget-dot" aria-hidden="true"></span>' +
          '<span class="brief-budget-text">' + opt.label + "</span>" +
        "</label>"
      );
    }).join("");

    container.innerHTML =
      '<fieldset class="brief-section">' +
        '<legend class="brief-section-head">Tus datos</legend>' +
        '<div class="brief-fields">' +
          '<label class="brief-field">' +
            '<span>Nombre y apellido <abbr class="brief-req" title="obligatorio">*</abbr></span>' +
            '<input type="text" name="fullName" placeholder="Nombre completo" autocomplete="name" required>' +
          "</label>" +
          '<div class="brief-row">' +
            '<label class="brief-field">' +
              '<span>Email <abbr class="brief-req" title="obligatorio">*</abbr></span>' +
              '<input type="email" name="email" placeholder="tu@email.com" autocomplete="email" required>' +
            "</label>" +
            '<label class="brief-field">' +
              "<span>Teléfono</span>" +
              '<input type="tel" name="phone" placeholder="+54 9 11 ..." autocomplete="tel">' +
            "</label>" +
          "</div>" +
          '<div class="brief-row">' +
            '<label class="brief-field">' +
              "<span>¿Desde qué país me escribís?</span>" +
              '<input type="text" name="country" placeholder="Argentina" autocomplete="country-name">' +
            "</label>" +
            '<label class="brief-field">' +
              "<span>Nombre de tu negocio</span>" +
              '<input type="text" name="business" placeholder="Nombre de tu marca" autocomplete="organization">' +
            "</label>" +
          "</div>" +
          '<label class="brief-field">' +
            "<span>Redes o web de tu marca, si tenés</span>" +
            '<input type="text" name="social" placeholder="instagram.com/tumarca">' +
          "</label>" +
        "</div>" +
      "</fieldset>" +
      '<fieldset class="brief-section">' +
        '<legend class="brief-section-head">Presupuesto</legend>' +
        '<p class="brief-budget-label">¿Qué presupuesto tenés pensado para el proyecto?</p>' +
        '<div class="brief-budget-options">' + budgetHtml + "</div>" +
      "</fieldset>" +
      '<fieldset class="brief-section">' +
        '<legend class="brief-section-head">El proyecto</legend>' +
        '<div class="brief-fields">' +
          '<label class="brief-field">' +
            "<span>¿Qué te atrajo de mi trabajo y por qué creés que encajaríamos bien?</span>" +
            '<textarea name="fit" rows="4" placeholder="Contame con tus palabras"></textarea>' +
          "</label>" +
          '<label class="brief-field brief-field--narrow">' +
            "<span>¿Cuándo planeás lanzar o relanzar tu marca?</span>" +
            '<input type="date" name="deadline">' +
          "</label>" +
        "</div>" +
      "</fieldset>";

    container.querySelectorAll(".brief-budget-option").forEach(function (label) {
      var input = label.querySelector("input");
      input.addEventListener("change", function () {
        container.querySelectorAll(".brief-budget-option").forEach(function (l) {
          l.classList.toggle("is-selected", l === label);
        });
      });
    });
  }

  var modalFormFields = $("#modal-form-fields");
  renderBriefFields(modalFormFields);

  var briefForm = $("#modal-form");
  var briefErrorEl = $("#modal-form-error");
  var briefStepForm = $("#brief-step-form");
  var briefStepThanks = $("#brief-step-thanks");
  var briefThanksTitle = $("#brief-thanks-title");

  function resetBrief() {
    if (briefForm) {
      briefForm.reset();
      briefForm.classList.remove("was-validated");
      $all("[aria-invalid]", briefForm).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    }
    if (modalFormFields) {
      modalFormFields.querySelectorAll(".brief-budget-option").forEach(function (l) {
        l.classList.remove("is-selected");
      });
    }
    if (briefErrorEl) briefErrorEl.hidden = true;
    if (briefStepForm) briefStepForm.hidden = false;
    if (briefStepThanks) briefStepThanks.hidden = true;
  }

  if (briefForm) {
    /* Un campo marcado como inválido se "desmarca" apenas se corrige. */
    briefForm.addEventListener("input", function (e) {
      if (e.target.hasAttribute("aria-invalid") && e.target.checkValidity()) {
        e.target.removeAttribute("aria-invalid");
      }
    });

    briefForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!briefForm.checkValidity()) {
        briefForm.classList.add("was-validated");
        var invalid = $all("input, textarea", briefForm).filter(function (el) { return !el.checkValidity(); });
        invalid.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });
        if (briefErrorEl) briefErrorEl.hidden = false;
        if (invalid[0]) invalid[0].focus();
        return;
      }
      if (briefErrorEl) briefErrorEl.hidden = true;
      var fullName = (briefForm.elements.fullName && briefForm.elements.fullName.value || "").trim();
      var firstName = fullName.split(" ")[0];
      if (briefThanksTitle) briefThanksTitle.textContent = firstName ? "Gracias, " + firstName + "." : "Gracias.";
      if (briefStepForm) briefStepForm.hidden = true;
      if (briefStepThanks) briefStepThanks.hidden = false;
      if (briefThanksTitle) briefThanksTitle.focus();
      /* NOTA: conectar a un endpoint propio, Formspree o Resend para recibir los envíos por email. */
    });
  }

  /* ---------------------------------------------------------------------
     Modal "Empezar proyecto"
     --------------------------------------------------------------------- */

  var modal = $("#project-modal");
  var modalClose = $("#modal-close");
  var modalTriggers = $all("[data-modal-trigger]");
  var lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    lastFocused = document.activeElement;
    if (mobileMenu && mobileMenu.classList.contains("is-open")) closeMenu();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    resetBrief();
  }

  modalTriggers.forEach(function (btn) { btn.addEventListener("click", openModal); });
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!modal || !modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    else trapFocus(modal, e);
  });

  /* ---------------------------------------------------------------------
     Lightbox de bocetos (solo sobre-mi.html — null-check en el primer nodo)
     --------------------------------------------------------------------- */

  var sketches = $all(".about-sketch");
  var sketchLightbox = $("#sketch-lightbox");

  if (sketches.length && sketchLightbox) {
    var sketchImg = $("#sketch-lightbox-img");
    var sketchTitle = $("#sketch-lightbox-title");
    var sketchCount = $("#sketch-lightbox-count");
    var sketchClose = $("#sketch-lightbox-close");
    var sketchPrev = $("#sketch-lightbox-prev");
    var sketchNext = $("#sketch-lightbox-next");
    var sketchIndex = 0;
    var sketchLastFocused = null;

    function renderSketch() {
      var sketch = sketches[sketchIndex];
      sketchImg.src = sketch.src;
      sketchImg.alt = sketch.alt;
      sketchTitle.textContent = sketch.alt;
      sketchCount.textContent = (sketchIndex + 1) + " / " + sketches.length;
    }

    function openSketch(i) {
      sketchIndex = i;
      sketchLastFocused = document.activeElement;
      renderSketch();
      sketchLightbox.classList.add("is-open");
      sketchLightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (sketchClose) sketchClose.focus();
    }

    function closeSketch() {
      sketchLightbox.classList.remove("is-open");
      sketchLightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (sketchLastFocused && sketchLastFocused.focus) sketchLastFocused.focus();
    }

    function stepSketch(dir) {
      sketchIndex = (sketchIndex + dir + sketches.length) % sketches.length;
      renderSketch();
    }

    sketches.forEach(function (sketch, i) {
      sketch.addEventListener("click", function () { openSketch(i); });
      sketch.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openSketch(i);
        }
      });
    });

    if (sketchClose) sketchClose.addEventListener("click", closeSketch);
    if (sketchPrev) sketchPrev.addEventListener("click", function () { stepSketch(-1); });
    if (sketchNext) sketchNext.addEventListener("click", function () { stepSketch(1); });

    sketchLightbox.addEventListener("click", function (e) {
      if (e.target === sketchLightbox) closeSketch();
    });

    document.addEventListener("keydown", function (e) {
      if (!sketchLightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeSketch();
      else if (e.key === "ArrowLeft") stepSketch(-1);
      else if (e.key === "ArrowRight") stepSketch(1);
      else trapFocus(sketchLightbox, e);
    });
  }
})();
