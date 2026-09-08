(function () {
  "use strict";

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

  var FORM_QUESTIONS = [
    { type: "text", name: "nombre", label: "¿Cuál es tu nombre y apellido?", required: true, autocomplete: "name" },
    { type: "email", name: "email", label: "Mail que utilices", required: true, autocomplete: "email" },
    { type: "tel", name: "telefono", label: "Número de teléfono", required: true, autocomplete: "tel" },
    { type: "text", name: "pais", label: "¿Desde qué país te contactás?", required: true },
    { type: "text", name: "negocio", label: "¿Cuál es el nombre de tu negocio?", required: true },
    { type: "text", name: "redes", label: "¿Tenés enlaces a redes sociales que te gustaría compartir? (si los hay)", required: false },
    { type: "radio", name: "ayuda", label: "¿En qué puedo ayudarte?", required: true, otherOption: true, options: ["Diseño de Logo", "Diseño de Identidad visual", "Diseño de Branding completo"] },
    { type: "textarea", name: "sobre_negocio", label: "Quisiera saber más sobre tu negocio... ¿Qué hacés y qué lo hace especial?", required: true },
    { type: "textarea", name: "objetivo", label: "¿Qué te gustaría conseguir o lograr con tu diseño de marca?", required: true },
    { type: "text", name: "vision", label: "¿Tenés una visión clara de la imagen de tu marca? (Si tenés un tablero de Pinterest, un panel de inspiración o cualquier otro recurso que capture tus ideas, adjuntá el enlace aquí)", required: false },
    { type: "radio", name: "inversion", label: "¿Cuánto invertirías en un proceso para que tu marca se vuelva inolvidable?", required: true, options: ["De 750 - 1200 USD", "De 1200 - 1800 USD", "De 1800 - 2900 USD", "Más de 3000 USD"] },
    { type: "textarea", name: "fit", label: "¿Qué te atrajo de mi trabajo y por qué creés que encajaríamos bien?", required: true },
    { type: "date", name: "fecha", label: "¿Cuándo planeás (re)lanzar tu marca? ¿Tenemos fecha límite para terminar el proyecto?", required: false }
  ];

  function renderFormFields(container, idPrefix) {
    if (!container) return;
    container.innerHTML = FORM_QUESTIONS.map(function (q, qi) {
      var fieldId = idPrefix + "-" + q.name;
      var reqAttr = q.required ? " required" : "";
      var reqMark = q.required ? "" : " <em>(opcional)</em>";

      if (q.type === "textarea") {
        return (
          '<label class="form-field">' +
            "<span>" + q.label + reqMark + "</span>" +
            '<textarea name="' + q.name + '" id="' + fieldId + '" rows="4"' + reqAttr + "></textarea>" +
          "</label>"
        );
      }

      if (q.type === "radio") {
        var options = q.options.slice();
        var groupName = idPrefix + "-" + q.name;
        var optionsHtml = options.map(function (opt, oi) {
          var optId = fieldId + "-" + oi;
          return (
            '<label class="form-radio">' +
              '<input type="radio" name="' + groupName + '" id="' + optId + '" value="' + opt + '"' + reqAttr + ">" +
              "<span>" + opt + "</span>" +
            "</label>"
          );
        }).join("");
        if (q.otherOption) {
          var otherId = fieldId + "-otros";
          optionsHtml += (
            '<label class="form-radio form-radio--other">' +
              '<input type="radio" name="' + groupName + '" id="' + otherId + '" value="Otros">' +
              "<span>Otros:</span>" +
              '<input type="text" class="form-radio-other-input" name="' + q.name + '_otros" aria-label="Especificá otro tipo de ayuda">' +
            "</label>"
          );
        }
        return (
          '<div class="form-field form-field--radio">' +
            "<span>" + q.label + reqMark + "</span>" +
            '<div class="form-radio-group">' + optionsHtml + "</div>" +
          "</div>"
        );
      }

      return (
        '<label class="form-field">' +
          "<span>" + q.label + reqMark + "</span>" +
          '<input type="' + q.type + '" name="' + q.name + '" id="' + fieldId + '"' +
          (q.autocomplete ? ' autocomplete="' + q.autocomplete + '"' : "") + reqAttr + ">" +
        "</label>"
      );
    }).join("");
  }

  function bindContactForm(formEl, errorEl, successEl) {
    if (!formEl) return;
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!formEl.checkValidity()) {
        if (errorEl) errorEl.hidden = false;
        if (successEl) successEl.hidden = true;
        return;
      }
      if (errorEl) errorEl.hidden = true;
      if (successEl) successEl.hidden = false;
      formEl.reset();
      /* NOTA: conectar a un endpoint propio, Formspree o Resend para recibir los envíos por email. */
    });
  }

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

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (progressBar) progressBar.style.width = (pct * 100).toFixed(2) + "%";
    if (dock) {
      var show = window.scrollY > window.innerHeight * 0.9 && pct < 0.94;
      dock.classList.toggle("is-visible", show);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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

  function renderRows() {
    if (!worksRows) return;
    var shown = PROJECTS.filter(function (p) { return currentFilter === "all" || p.cat === currentFilter; });
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
      renderRows();
    });
  });

  renderRows();

  /* ---------------------------------------------------------------------
     FAQ acordeón
     --------------------------------------------------------------------- */

  var faqList = $("#faq-list");
  var openFaq = 0;

  function renderFaq() {
    if (!faqList) return;
    faqList.innerHTML = FAQ.map(function (f, i) {
      var isOpen = i === openFaq;
      return (
        '<div class="faq-item">' +
          '<button type="button" class="faq-question" data-index="' + i + '" aria-expanded="' + isOpen + '" aria-controls="faq-panel-' + i + '" id="faq-btn-' + i + '">' +
            "<span>" + f.q + "</span>" +
            '<span class="faq-icon" aria-hidden="true">' + (isOpen ? "−" : "+") + "</span>" +
          "</button>" +
          (isOpen ? '<p class="faq-answer" id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '">' + f.a + "</p>" : "") +
        "</div>"
      );
    }).join("");
    $all(".faq-question", faqList).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = Number(btn.dataset.index);
        openFaq = openFaq === i ? -1 : i;
        renderFaq();
      });
    });
  }

  renderFaq();

  /* ---------------------------------------------------------------------
     Formulario de contacto
     --------------------------------------------------------------------- */

  renderFormFields($("#contact-form-fields"), "contact");
  bindContactForm($("#contact-form"), $("#contact-form-error"), $("#contact-form-success"));

  renderFormFields($("#modal-form-fields"), "modal");
  bindContactForm($("#modal-form"), $("#modal-form-error"), $("#modal-form-success"));

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
