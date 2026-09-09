(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Forzar inicio en el top (evita que el navegador restaure el scroll
     de una visita anterior o de la cache bfcache al entrar al sitio).
     --------------------------------------------------------------------- */

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  if (!location.hash) {
    window.scrollTo(0, 0);
  }
  window.addEventListener("pageshow", function (e) {
    if (!location.hash && (e.persisted || window.scrollY > 0)) {
      window.scrollTo(0, 0);
    }
  });

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* ---------------------------------------------------------------------
     Data
     --------------------------------------------------------------------- */

  var PROJECTS = [
    { name: "The Outdoor Project", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/outdoor-project.jpg", url: "https://www.behance.net/gallery/255113623/The-Outdoor-Project-Identidad-Visual" },
    { name: "Iron Lab", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/iron-lab.jpg", url: "https://www.behance.net/gallery/251067825/Iron-Lab-Identidad-Visual" },
    { name: "BulaVinaka", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/bulavinaka.jpg", url: "https://www.behance.net/gallery/248896559/BulaVinaka-Identidad-Visual" },
    { name: "HomeBoyz", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/homeboyz.jpg", url: "https://www.behance.net/gallery/226166415/HomeBoyz-Identidad-Visual" },
    { name: "Salentein", tag: "Branding", cat: "branding", img: "assets/img/portfolio/salentein.jpg", url: "https://www.behance.net/gallery/190253803/Salentein-Un-viaje-sensorial" },
    { name: "EtherCore", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/ethercore.jpg", url: "https://www.behance.net/gallery/218318827/EtherCore-Identidad-Visual" },
    { name: "Libema", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/libema.jpg", url: "https://www.behance.net/gallery/217216779/Libema-Identidad-Visual" },
    { name: "33usd", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/33usd.jpg", url: "https://www.behance.net/gallery/191433895/33usd-Identidad-Visual" },
    { name: "ArmonyDrinks", tag: "Identidad Visual", cat: "identidad", img: "assets/img/portfolio/armonydrinks.jpg", url: "https://www.behance.net/gallery/191444525/ArmonyDrinks-Identidad-Visual" },
    { name: "La Pelota No Se Mancha", tag: "Campaña Social", cat: "social", img: "assets/img/portfolio/la-pelota-no-se-mancha.jpg", url: "https://www.behance.net/gallery/164034163/La-Pelota-No-Se-Mancha-Campana-Social" },
    { name: "Hawaiian Tropic — Tattoo Line", tag: "Packaging", cat: "packaging", img: "assets/img/portfolio/hawaiian-tropic.jpg", url: "https://www.behance.net/gallery/166106825/Hawaiian-Tropic-Tattoo-Line" },
    { name: "RE-EVOLUCIÓN", tag: "Sistema de Vinilos", cat: "packaging", img: "assets/img/portfolio/re-evolucion.jpg", url: "https://www.behance.net/gallery/193912543/RE-EVOLUCION-Sistema-de-Vinilos" },
    { name: "INSURGENTE", tag: "Packaging", cat: "packaging", img: "assets/img/portfolio/insurgente.jpg", url: "https://www.behance.net/gallery/164594839/INSURGENTE-Cerveza-Craft-Mexicana" }
  ];

  var FAQ = [
    { q: "¿Cuánto sale un proyecto de marca?", a: "Depende del alcance: un logotipo puntual no es lo mismo que una identidad visual completa con manual y aplicaciones. Después de una llamada de 20 minutos te envío una propuesta cerrada, con etapas, plazos y precio final sin sorpresas." },
    { q: "¿Cuánto tarda?", a: "Entre 3 y 6 semanas según complejidad y velocidad de feedback. La agenda se reserva por orden de seña y trabajo un máximo de 2 proyectos por mes para no bajar el nivel de dedicación." },
    { q: "¿Qué recibo al final?", a: "Logotipo en todas sus versiones y formatos productivos (vectorial y mapa de bits), sistema visual completo, manual de marca en PDF y las aplicaciones acordadas listas para imprimir o publicar." },
    { q: "¿Trabajás con marcas de otros países?", a: "Sí. El proceso es 100% remoto por videollamada y mail; hoy trabajo con clientes de Argentina, México y España sin diferencia de calidad ni de plazos." },
    { q: "¿Y si no me gusta la propuesta?", a: "Cada etapa se aprueba antes de avanzar y las rondas de corrección se definen en la propuesta inicial. No hay entregas sorpresa: vas viendo y validando el camino conmigo." }
  ];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------
     Scroll progress bar + dock flotante
     --------------------------------------------------------------------- */

  var progressBar = $("#scroll-progress");
  var dock = $("#floating-dock");
  var backToTop = $("#back-to-top");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (progressBar) progressBar.style.width = (pct * 100).toFixed(2) + "%";
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
     Contadores (hero stats)
     --------------------------------------------------------------------- */

  var statTargets = [
    { el: $("#stat-0"), to: 40, prefix: "+", suffix: "" },
    { el: $("#stat-1"), to: 6, prefix: "", suffix: "" },
    { el: $("#stat-2"), to: 100, prefix: "", suffix: "%" }
  ];

  function countUp() {
    if (reducedMotion) {
      statTargets.forEach(function (t) { if (t.el) t.el.textContent = t.prefix + t.to + t.suffix; });
      return;
    }
    var start = null;
    var dur = 1600;
    function tick(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      statTargets.forEach(function (target) {
        if (target.el) target.el.textContent = target.prefix + Math.round(target.to * e) + target.suffix;
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statsGrid = $(".stats-grid");
  if (statsGrid && "IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsGrid);
  } else if (statsGrid) {
    countUp();
  }

  /* ---------------------------------------------------------------------
     Nav hamburguesa (mobile)
     --------------------------------------------------------------------- */

  var navToggle = $("#nav-toggle");
  var mobileMenu = $("#mobile-menu");
  var mobileMenuClose = $("#mobile-menu-close");
  if (navToggle && mobileMenu) {
    var closeMenu = function () {
      mobileMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    navToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMenu);
    $all("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Portfolio: filtros + filas + preview flotante
     --------------------------------------------------------------------- */

  var worksRows = $("#works-rows");
  var filters = $all(".filter-pill");
  var currentFilter = "all";
  var preview = $("#work-preview");
  var previewImg = $("#work-preview-img");
  var loadMoreWrap = $("#works-load-more-wrap");
  var loadMoreBtn = $("#works-load-more");
  var desktopMq = window.matchMedia("(min-width: 901px)");
  var visibleCount = desktopMq.matches ? 5 : 4;

  function worksPageSize() {
    return desktopMq.matches ? 5 : 4;
  }

  function renderRows() {
    if (!worksRows) return;
    var all = PROJECTS.filter(function (p) { return currentFilter === "all" || p.cat === currentFilter; });
    var shown = all.slice(0, visibleCount);
    if (loadMoreWrap) loadMoreWrap.classList.toggle("is-hidden", visibleCount >= all.length);
    worksRows.innerHTML = shown.map(function (p, i) {
      var num = String(i + 1).padStart(2, "0");
      return (
        '<a href="' + p.url + '" target="_blank" rel="noopener" class="work-row" data-img="' + p.img + '" data-name="' + p.name + '">' +
          '<span class="work-row-left">' +
            '<span class="work-row-num">' + num + "</span>" +
            '<span class="work-row-name">' + p.name + "</span>" +
          "</span>" +
          '<span class="work-row-right">' +
            '<span class="work-row-tag">' + p.tag + "</span>" +
            '<span class="work-row-arrow">↗</span>' +
          "</span>" +
        "</a>"
      );
    }).join("");
    bindRowEvents();
  }

  function bindRowEvents() {
    if (isCoarsePointer || !preview || !previewImg) return;
    $all(".work-row", worksRows).forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        previewImg.src = row.dataset.img || "";
        previewImg.alt = row.dataset.name || "";
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
      filters.forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
      visibleCount = worksPageSize();
      renderRows();
    });
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      visibleCount += worksPageSize();
      renderRows();
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
     FAQ acordeón
     --------------------------------------------------------------------- */

  var faqList = $("#faq-list");
  var openFaq = 0;

  function renderFaq() {
    if (!faqList) return;
    faqList.innerHTML = FAQ.map(function (f, i) {
      return (
        '<div class="faq-item" data-index="' + i + '">' +
          '<button type="button" class="faq-question" data-index="' + i + '" aria-expanded="false" aria-controls="faq-panel-' + i + '" id="faq-btn-' + i + '">' +
            "<span>" + f.q + "</span>" +
            '<span class="faq-icon" aria-hidden="true">+</span>' +
          "</button>" +
          '<div class="faq-answer-wrap" id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '">' +
            '<div class="faq-answer-inner"><p class="faq-answer">' + f.a + "</p></div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
    var items = $all(".faq-item", faqList);
    $all(".faq-question", faqList).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = Number(btn.dataset.index);
        var willOpen = openFaq !== i;
        openFaq = willOpen ? i : -1;
        items.forEach(function (item) {
          var itemIndex = Number(item.dataset.index);
          var isOpen = itemIndex === openFaq;
          item.classList.toggle("is-open", isOpen);
          $(".faq-question", item).setAttribute("aria-expanded", isOpen);
        });
      });
    });
  }

  renderFaq();

  /* ---------------------------------------------------------------------
     Brief (formulario del popup "Empezar proyecto")
     --------------------------------------------------------------------- */

  var BUDGET_OPTIONS = [
    { value: "750-1200", label: "De 750 - 1200 USD" },
    { value: "1200-1800", label: "De 1200 - 1800 USD" },
    { value: "1800-2900", label: "De 1800 - 2900 USD" },
    { value: "3000+", label: "Más de 3000 USD" }
  ];

  function renderBriefFields(container) {
    if (!container) return;
    var budgetHtml = BUDGET_OPTIONS.map(function (opt) {
      return (
        '<label class="brief-budget-option">' +
          '<span class="brief-budget-dot"><span class="brief-budget-dot-inner"></span></span>' +
          '<input type="radio" name="budget" value="' + opt.value + '">' +
          "<span>" + opt.label + "</span>" +
        "</label>"
      );
    }).join("");

    container.innerHTML =
      '<div class="brief-section">' +
        '<div class="brief-section-head">' +
          '<span class="brief-section-num">01</span>' +
          '<span class="brief-section-label">Tus datos</span>' +
          '<span class="brief-section-line"></span>' +
        "</div>" +
        '<div class="brief-fields">' +
          '<label class="brief-field">' +
            "<span>¿Cuál es tu nombre y apellido?</span>" +
            '<input type="text" name="fullName" placeholder="Nombre completo" autocomplete="name" required>' +
          "</label>" +
          '<div class="brief-row">' +
            '<label class="brief-field">' +
              "<span>Mail que utilices</span>" +
              '<input type="email" name="email" placeholder="tu@email.com" autocomplete="email" required>' +
            "</label>" +
            '<label class="brief-field">' +
              "<span>Número de teléfono</span>" +
              '<input type="tel" name="phone" placeholder="+54 9 11 ..." autocomplete="tel">' +
            "</label>" +
          "</div>" +
          '<div class="brief-row">' +
            '<label class="brief-field">' +
              "<span>¿Desde qué país te contactás?</span>" +
              '<input type="text" name="country" placeholder="Argentina">' +
            "</label>" +
            '<label class="brief-field">' +
              "<span>¿Cuál es el nombre de tu negocio?</span>" +
              '<input type="text" name="business" placeholder="Nombre de tu marca">' +
            "</label>" +
          "</div>" +
          '<label class="brief-field">' +
            "<span>¿Tenés enlaces a redes sociales que te gustaría compartir? <em>(opcional)</em></span>" +
            '<input type="text" name="social" placeholder="instagram.com/tumarca">' +
          "</label>" +
        "</div>" +
      "</div>" +
      '<div class="brief-section">' +
        '<div class="brief-section-head">' +
          '<span class="brief-section-num brief-section-num--light">02</span>' +
          '<span class="brief-section-label">Inversión</span>' +
          '<span class="brief-section-line"></span>' +
        "</div>" +
        '<span class="brief-field-label brief-budget-label">¿Cuánto invertirías en un proceso para que tu marca se vuelva inolvidable?</span>' +
        '<div class="brief-budget-options">' + budgetHtml + "</div>" +
      "</div>" +
      '<div class="brief-section">' +
        '<div class="brief-section-head">' +
          '<span class="brief-section-num">03</span>' +
          '<span class="brief-section-label">El proyecto</span>' +
          '<span class="brief-section-line"></span>' +
        "</div>" +
        '<div class="brief-fields">' +
          '<label class="brief-field">' +
            "<span>¿Qué te atrajo de mi trabajo y por qué creés que encajaríamos bien?</span>" +
            '<textarea name="fit" rows="4" placeholder="Contame con tus palabras..."></textarea>' +
          "</label>" +
          '<label class="brief-field brief-field--narrow">' +
            "<span>¿Cuándo planeás (re)lanzar tu marca? <em>(opcional)</em></span>" +
            '<input type="date" name="deadline">' +
          "</label>" +
        "</div>" +
      "</div>";

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
    if (briefForm) briefForm.reset();
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
    briefForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!briefForm.checkValidity()) {
        if (briefErrorEl) briefErrorEl.hidden = false;
        return;
      }
      if (briefErrorEl) briefErrorEl.hidden = true;
      var fullName = (briefForm.elements.fullName && briefForm.elements.fullName.value || "").trim();
      var firstName = fullName.split(" ")[0] || "crack";
      if (briefThanksTitle) briefThanksTitle.textContent = "Gracias, " + firstName + ".";
      if (briefStepForm) briefStepForm.hidden = true;
      if (briefStepThanks) briefStepThanks.hidden = false;
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
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) closeModal();
  });
})();
