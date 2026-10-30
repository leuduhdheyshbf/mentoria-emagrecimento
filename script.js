/* ============================================================
   MÉTODO LEVE — Interações
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Header: sombra ao rolar ---------- */
  var header = document.getElementById('header');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha o menu ao clicar em um link
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Fecha o menu ao redimensionar para desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- FAQ: abre um e fecha os outros ---------- */
  var faqItems = document.querySelectorAll('#faqList .faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Animação de entrada (reveal on scroll) ---------- */
  var revealTargets = document.querySelectorAll(
    '.pillar, .step, .testimonial, .plan, .section__intro, .checklist, .hero-card'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Formulário de captura ---------- */
  var form = document.getElementById('leadForm');
  var success = document.getElementById('formSuccess');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Aqui você conecta com seu backend, e-mail marketing
    // (RD Station, Mailchimp, etc.) ou webhook do WhatsApp.
    var lead = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      data: new Date().toISOString()
    };
    console.log('Novo lead:', lead);

    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    window.setTimeout(function () { success.hidden = true; }, 8000);
  });

  /* ---------- Máscara simples de WhatsApp ---------- */
  var phoneInput = form.querySelector('input[name="whatsapp"]');
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);
    var formatted = digits;

    if (digits.length > 2) {
      formatted = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    }
    if (digits.length > 7) {
      var splitAt = digits.length > 10 ? 7 : 6;
      formatted = '(' + digits.slice(0, 2) + ') ' +
                  digits.slice(2, splitAt) + '-' + digits.slice(splitAt);
    }
    phoneInput.value = formatted;
  });

  /* ---------- Ano automático no rodapé ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
