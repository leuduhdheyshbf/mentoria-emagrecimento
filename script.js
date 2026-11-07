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

  /* ---------- Formulário de captura e Integração WhatsApp ---------- */
  var form = document.getElementById('leadForm');
  var success = document.getElementById('formSuccess');
  var directWhatsappBtn = document.getElementById('directWhatsappBtn');
  var leadPlanSelect = document.getElementById('leadPlan');
  var leadGoalInput = document.getElementById('leadGoal');
  var leadDiagBox = document.getElementById('leadDiagBox');
  var leadDiagText = document.getElementById('leadDiagText');

  // Estado diagnóstico do visitante
  var visitorDiag = {
    bmi: null,
    weightDiff: null,
    weeks: null,
    quizProfile: null
  };

  function updateDiagBanner() {
    var parts = [];
    if (visitorDiag.bmi) parts.push('IMC: ' + visitorDiag.bmi);
    if (visitorDiag.weightDiff) parts.push('Meta: −' + visitorDiag.weightDiff + ' kg');
    if (visitorDiag.quizProfile) parts.push('Perfil: ' + visitorDiag.quizProfile);

    if (parts.length > 0 && leadDiagBox && leadDiagText) {
      leadDiagText.textContent = parts.join(' · ');
      leadDiagBox.hidden = false;
    }
  }

  // Preenche plano a partir dos botões da tabela de planos
  document.querySelectorAll('[data-select-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.getAttribute('data-select-plan');
      if (leadPlanSelect && plan) {
        leadPlanSelect.value = plan;
      }
    });
  });

  // Salva rascunho no localStorage
  function saveLeadDraft() {
    try {
      var draft = {
        nome: form.nome.value,
        email: form.email.value,
        whatsapp: form.whatsapp.value,
        plano: leadPlanSelect ? leadPlanSelect.value : '',
        meta: leadGoalInput ? leadGoalInput.value : ''
      };
      localStorage.setItem('metodoleve_lead_draft', JSON.stringify(draft));
    } catch (e) {}
  }

  // Recupera rascunho anterior se houver
  try {
    var savedDraft = localStorage.getItem('metodoleve_lead_draft');
    if (savedDraft) {
      var parsed = JSON.parse(savedDraft);
      if (parsed.nome) form.nome.value = parsed.nome;
      if (parsed.email) form.email.value = parsed.email;
      if (parsed.whatsapp) form.whatsapp.value = parsed.whatsapp;
      if (parsed.plano && leadPlanSelect) leadPlanSelect.value = parsed.plano;
      if (parsed.meta && leadGoalInput) leadGoalInput.value = parsed.meta;
    }
  } catch (e) {}

  form.addEventListener('input', saveLeadDraft);

  // Submissão padrão do formulário
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var lead = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      plano: leadPlanSelect ? leadPlanSelect.value : 'Mentoria Completa',
      meta: leadGoalInput ? leadGoalInput.value.trim() : '',
      diagnostico: visitorDiag,
      data: new Date().toISOString()
    };
    console.log('Novo lead registrado:', lead);

    try {
      localStorage.setItem('metodoleve_last_lead', JSON.stringify(lead));
      localStorage.removeItem('metodoleve_lead_draft');
    } catch (e) {}

    form.reset();
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      window.setTimeout(function () { success.hidden = true; }, 10000);
    }
  });

  // Botão direto para WhatsApp com mensagem personalizada e diagnóstico
  if (directWhatsappBtn) {
    directWhatsappBtn.addEventListener('click', function () {
      var nome = form.nome.value.trim() || 'Olá';
      var plano = leadPlanSelect ? leadPlanSelect.value : 'Mentoria Completa';
      var meta = leadGoalInput ? leadGoalInput.value.trim() : '';

      var msg = 'Olá! Me chamo ' + (nome !== 'Olá' ? nome : '') + ' e tenho interesse na *' + plano + '* do Método Leve.';

      var diagParts = [];
      if (visitorDiag.bmi) diagParts.push('IMC calculado: ' + visitorDiag.bmi);
      if (visitorDiag.weightDiff) diagParts.push('Meta de perda: −' + visitorDiag.weightDiff + ' kg em ~' + visitorDiag.weeks + ' semanas');
      if (visitorDiag.quizProfile) diagParts.push('Perfil de travamento: ' + visitorDiag.quizProfile);
      if (meta) diagParts.push('Meu objetivo: ' + meta);

      if (diagParts.length > 0) {
        msg += '\n\n*Meu Diagnóstico:* \n• ' + diagParts.join('\n• ');
      }
      msg += '\n\nGostaria de agendar minha conversa gratuita de 20 minutos!';

      var waUrl = 'https://wa.me/5511999999999?text=' + encodeURIComponent(msg);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- Máscara simples de WhatsApp ---------- */
  var phoneInput = form.querySelector('input[name="whatsapp"]');
  if (phoneInput) {
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
  }

  /* ---------- Calculadora Metabólica & IMC ---------- */
  var calcForm = document.getElementById('calcForm');
  if (calcForm) {
    var resBmiValue = document.getElementById('resBmiValue');
    var resBmiBadge = document.getElementById('resBmiBadge');
    var resWeightDiff = document.getElementById('resWeightDiff');
    var bmiPin = document.getElementById('bmiPin');
    var resTdee = document.getElementById('resTdee');
    var resCalGoal = document.getElementById('resCalGoal');
    var resWeeks = document.getElementById('resWeeks');
    var calcApplyBtn = document.getElementById('calcApplyBtn');

    function calculateMetabolism() {
      var gender = calcForm.querySelector('input[name="gender"]:checked').value;
      var age = parseFloat(document.getElementById('calcAge').value) || 30;
      var height = parseFloat(document.getElementById('calcHeight').value) || 165;
      var weight = parseFloat(document.getElementById('calcWeight').value) || 75;
      var target = parseFloat(document.getElementById('calcTarget').value) || 65;
      var activity = parseFloat(document.getElementById('calcActivity').value) || 1.375;

      var heightM = height / 100;
      var bmi = weight / (heightM * heightM);
      var weightDiff = weight - target;

      // Equação Mifflin-St Jeor
      var bmr = (10 * weight) + (6.25 * height) - (5 * age);
      if (gender === 'male') {
        bmr += 5;
      } else {
        bmr -= 161;
      }

      var tdee = Math.round(bmr * activity);
      var minCal = gender === 'male' ? 1500 : 1250;
      var calGoal = Math.max(Math.round(tdee - 450), minCal);

      // Estimativa realista: ~0.55 kg/semana saudável
      var weeksMin = weightDiff > 0 ? Math.max(Math.round(weightDiff / 0.7), 2) : 0;
      var weeksMax = weightDiff > 0 ? Math.max(Math.round(weightDiff / 0.5), 3) : 0;

      // Classificação do IMC
      var badgeText = 'Normal';
      var badgeClass = 'calc-badge--normal';
      if (bmi < 18.5) {
        badgeText = 'Abaixo do peso';
        badgeClass = 'calc-badge--normal';
      } else if (bmi <= 24.9) {
        badgeText = 'Saudável';
        badgeClass = 'calc-badge--normal';
      } else if (bmi <= 29.9) {
        badgeText = 'Sobrepeso';
        badgeClass = 'calc-badge--over';
      } else if (bmi <= 34.9) {
        badgeText = 'Obesidade I';
        badgeClass = 'calc-badge--ob1';
      } else {
        badgeText = 'Obesidade II+';
        badgeClass = 'calc-badge--ob2';
      }

      // Posição do pino na régua (escala de 15 a 40)
      var pinPct = Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 3), 97);

      // Renderização
      if (resBmiValue) resBmiValue.textContent = bmi.toFixed(1);
      if (resBmiBadge) {
        resBmiBadge.textContent = badgeText;
        resBmiBadge.className = 'calc-badge ' + badgeClass;
      }
      if (resWeightDiff) {
        resWeightDiff.textContent = (weightDiff > 0 ? '−' : '+') + Math.abs(weightDiff).toFixed(1) + ' kg';
      }
      if (bmiPin) bmiPin.style.left = pinPct + '%';
      if (resTdee) resTdee.textContent = tdee.toLocaleString('pt-BR') + ' kcal';
      if (resCalGoal) resCalGoal.textContent = calGoal.toLocaleString('pt-BR') + ' kcal';
      if (resWeeks) {
        if (weightDiff > 0) {
          resWeeks.textContent = '~' + weeksMin + ' a ' + weeksMax + ' semanas';
        } else {
          resWeeks.textContent = 'Manutenção / Ganho';
        }
      }

      // Atualiza estado global do diagnóstico
      visitorDiag.bmi = bmi.toFixed(1) + ' (' + badgeText + ')';
      visitorDiag.weightDiff = Math.abs(weightDiff).toFixed(1);
      visitorDiag.weeks = weeksMin + ' a ' + weeksMax;
    }

    calcForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculateMetabolism();
      var box = document.getElementById('calcResultBox');
      if (box && window.innerWidth <= 900) {
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    calcForm.addEventListener('input', calculateMetabolism);
    calculateMetabolism(); // Executa inicial

    if (calcApplyBtn) {
      calcApplyBtn.addEventListener('click', function () {
        calculateMetabolism();
        updateDiagBanner();
        if (leadGoalInput && visitorDiag.weightDiff) {
          leadGoalInput.value = 'Eliminar ' + visitorDiag.weightDiff + ' kg de forma saudável e duradoura';
        }
      });
    }
  }

  /* ---------- Quiz de Diagnóstico Comportamental ---------- */
  var quizContainer = document.getElementById('quizContainer');
  if (quizContainer) {
    var quizBar = document.getElementById('quizBar');
    var quizSteps = quizContainer.querySelectorAll('.quiz-step');
    var quizRestart = document.getElementById('quizRestart');
    var quizResultTitle = document.getElementById('quizResultTitle');
    var quizResultDesc = document.getElementById('quizResultDesc');
    var quizResultPillar = document.getElementById('quizResultPillar');
    var quizResultCta = document.getElementById('quizResultCta');

    var quizAnswers = [];

    var profilesData = {
      compulsao: {
        title: 'Seu Perfil: Fome Emocional & Compulsão Noturna',
        desc: 'Seu corpo não está falhando: seu cérebro aprendeu a usar doces e carboidratos como amortecedor de cansaço e estresse. Fazer dietas ainda mais restritivas só alimenta o ciclo de compulsão e culpa.',
        pillar: 'Pilar 3: Mente & Hábitos + Estratégia de Saciedade'
      },
      rotina: {
        title: 'Seu Perfil: Rotina Sobrecarregada & Sem Tempo',
        desc: 'Dietas com ingredientes exóticos e treinos de 2 horas não cabem na vida real. Você precisa de um método ultraprático, com opções fáceis em restaurantes e treinos eficientes de 35 minutos.',
        pillar: 'Pilar 1 e 2: Nutrição Prática sem Marmitas Infinitas + Treino Inteligente'
      },
      sanfona: {
        title: 'Seu Perfil: Metabolismo Adaptado (Efeito Sanfona)',
        desc: 'Anos de dietas ' + 'malucas' + ' fizeram seu metabolismo entrar em modo de sobrevivência, queimando menos calorias basais. O caminho é acelerar sua taxa metabólica comendo comida de verdade.',
        pillar: 'Pilar 1: Reestruturação Metabólica sem Restrição Severa'
      },
      solidao: {
        title: 'Seu Perfil: Desistência por Falta de Suporte',
        desc: 'Você sabe o que precisa fazer, mas quando a rotina aperta ou a motivação inicial passa, não ter com quem tirar dúvidas e ajustar o plano faz você desistir. Acompanhamento diário muda o jogo.',
        pillar: 'Pilar 4: Acompanhamento Próximo Individualizado'
      }
    };

    function showQuizStep(stepIndex) {
      quizSteps.forEach(function (step) {
        step.classList.remove('is-active');
      });
      if (quizSteps[stepIndex]) {
        quizSteps[stepIndex].classList.add('is-active');
      }

      var progressPct = ((stepIndex + 1) / 3) * 100;
      if (stepIndex >= 3) progressPct = 100;
      if (quizBar) quizBar.style.width = Math.min(progressPct, 100) + '%';
    }

    quizContainer.querySelectorAll('.quiz-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var trait = btn.getAttribute('data-trait');
        quizAnswers.push(trait);

        var currentStepEl = btn.closest('.quiz-step');
        var stepNum = parseInt(currentStepEl.getAttribute('data-step'), 10);

        if (stepNum < 3) {
          showQuizStep(stepNum);
        } else {
          // Calcula trait dominante
          var counts = {};
          quizAnswers.forEach(function (t) {
            counts[t] = (counts[t] || 0) + 1;
          });
          var dominant = quizAnswers[quizAnswers.length - 1];
          var maxCount = 0;
          for (var k in counts) {
            if (counts[k] > maxCount) {
              maxCount = counts[k];
              dominant = k;
            }
          }

          var resData = profilesData[dominant] || profilesData.compulsao;
          if (quizResultTitle) quizResultTitle.textContent = resData.title;
          if (quizResultDesc) quizResultDesc.textContent = resData.desc;
          if (quizResultPillar) quizResultPillar.textContent = resData.pillar;

          visitorDiag.quizProfile = resData.title.replace('Seu Perfil: ', '');
          showQuizStep(3); // Result step
        }
      });
    });

    if (quizRestart) {
      quizRestart.addEventListener('click', function () {
        quizAnswers = [];
        showQuizStep(0);
      });
    }

    if (quizResultCta) {
      quizResultCta.addEventListener('click', function () {
        updateDiagBanner();
      });
    }
  }

  /* ---------- Switch de Ciclo (Mensal / Trimestral) ---------- */
  var billingToggle = document.getElementById('billingToggle');
  var billingMonthlyLabel = document.getElementById('billingMonthlyLabel');
  var billingQuarterlyLabel = document.getElementById('billingQuarterlyLabel');

  if (billingToggle) {
    var isQuarterly = false;

    billingToggle.addEventListener('click', function () {
      isQuarterly = !isQuarterly;
      billingToggle.setAttribute('aria-checked', String(isQuarterly));

      if (billingMonthlyLabel) {
        billingMonthlyLabel.classList.toggle('billing-opt--active', !isQuarterly);
      }
      if (billingQuarterlyLabel) {
        billingQuarterlyLabel.classList.toggle('billing-opt--active', isQuarterly);
      }

      // Atualiza valores dos planos
      document.querySelectorAll('.plan__amount').forEach(function (el) {
        var val = isQuarterly ? el.getAttribute('data-quarterly') : el.getAttribute('data-monthly');
        if (val) el.textContent = val;
      });

      // Atualiza subtítulos dos planos
      document.querySelectorAll('.plan__subtext').forEach(function (el) {
        var sub = isQuarterly ? el.getAttribute('data-sub-quarterly') : el.getAttribute('data-sub-monthly');
        if (sub) el.textContent = sub;
      });
    });
  }

  /* ---------- Ano automático no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
