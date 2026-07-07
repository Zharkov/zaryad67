/* ============================================================
   ООО «Заряд» — скрипты
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Бургер-меню ---------- */
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Появление секций при прокрутке ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Активный пункт навигации при прокрутке ---------- */
  const navSections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navSections.length && navLinks.length) {
    function updateActiveLink() {
      const scrollY = window.scrollY + 120;
      let current = '';
      navSections.forEach(function (s) {
        if (scrollY >= s.offsetTop) current = s.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  /* ---------- Бегущие цифры ---------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = (el.getAttribute('data-decimals') | 0);
    const duration = 1600;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }

    let start = null;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const val = target * easeOutCubic(p);
      el.textContent = val.toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  const nums = document.querySelectorAll('.num[data-target]');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      const statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateCount(e.target);
            statObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { statObserver.observe(n); });
    } else {
      nums.forEach(animateCount);
    }
  }

  /* ---------- Маска телефона ---------- */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    function maskPhone() {
      let d = this.value.replace(/\D/g, '');
      if (d.length && d[0] === '8') d = '7' + d.slice(1);
      if (d.length && d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      let r = '';
      for (let i = 0; i < d.length; i++) {
        if      (i === 0) r += '+' + d[i];
        else if (i === 1) r += ' (' + d[i];
        else if (i === 4) r += ') ' + d[i];
        else if (i === 7) r += '-' + d[i];
        else if (i === 9) r += '-' + d[i];
        else              r += d[i];
      }
      this.value = r;
    }
    phoneInput.addEventListener('input', maskPhone);
    phoneInput.addEventListener('focus', function () {
      if (!this.value) this.value = '+7 (';
    });
    phoneInput.addEventListener('blur', function () {
      if (this.value === '+7 (') this.value = '';
    });
  }

  /* ---------- Кнопка «наверх» ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Лайтбокс ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button class="lightbox-close" aria-label="Закрыть">✕</button><img src="" alt="" />';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector('img');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.proj img, .tech-card img').forEach(function (img) {
    img.addEventListener('click', function () { openLightbox(this.src, this.alt); });
  });
  lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Форма заявки → FormSubmit.co ---------- */
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Отправляем…';

      const data = {
        name:      form.querySelector('[name="name"]').value,
        phone:     form.querySelector('[name="phone"]').value,
        task:      form.querySelector('[name="task"]').value,
        _subject:  'Заявка с сайта ООО «Заряд»',
        _template: 'table'
      };

      fetch('https://formsubmit.co/ajax/zaryadooo@yandex.ru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function (r) { return r.json(); })
      .then(function () {
        form.innerHTML =
          '<div class="form-success">' +
            '<div class="form-success-icon">✓</div>' +
            '<h3>Заявка принята!</h3>' +
            '<p>Свяжемся с вами в течение рабочего дня.</p>' +
          '</div>';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Отправить заявку';
        alert('Не удалось отправить. Позвоните нам: +7 (900) 226-30-13');
      });
    });
  }
})();
