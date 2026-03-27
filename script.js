const header = document.querySelector('.site-header');
const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const mqDesktop = window.matchMedia('(min-width: 1024px)');
const root = document.documentElement;
root.classList.add('js');

const handleHeaderState = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
};

handleHeaderState();
let ticking = false;
window.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      handleHeaderState();
      ticking = false;
    });
  },
  { passive: true }
);

const closeMenu = () => {
  if (!menuToggle || !menuOverlay) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.classList.remove('active');
  menuOverlay.hidden = true;
  document.body.style.overflow = '';
};

if (menuOverlay) {
  menuOverlay.hidden = true;
  document.body.style.overflow = '';
}

if (menuToggle && menuOverlay) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.classList.toggle('active', !expanded);
    menuOverlay.hidden = expanded;
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  menuOverlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (mqDesktop.matches) closeMenu();
  });

  window.addEventListener('hashchange', closeMenu);
}

const revealElements = document.querySelectorAll('.reveal');

const showAllRevealElements = () => {
  revealElements.forEach((el) => {
    el.classList.add('is-visible');
    el.classList.remove('reveal-init');
  });
};

if (revealElements.length > 0) {
  try {
    revealElements.forEach((el) => el.classList.add('reveal-init'));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = entry.target.dataset.delay || '0';
            entry.target.style.transitionDelay = `${delay}s`;
            entry.target.classList.add('is-visible');
            entry.target.classList.remove('reveal-init');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );

      revealElements.forEach((el) => observer.observe(el));
      window.setTimeout(showAllRevealElements, 1600);
    } else {
      showAllRevealElements();
    }
  } catch (error) {
    showAllRevealElements();
  }
}

const contactForm = document.querySelector('.contact-form');
const formFeedback = document.getElementById('formFeedback');

contactForm?.addEventListener('submit', async (event) => {
  const form = event.currentTarget;
  if (!form.checkValidity()) return;

  const formEndpoint = (form.dataset.formEndpoint || form.getAttribute('action') || '').trim();
  const hasValidEndpoint = Boolean(formEndpoint) && !/your-id/i.test(formEndpoint);
  delete form.dataset.nativeSubmitted;

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent || '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
  }

  if (formFeedback) {
    formFeedback.hidden = true;
    formFeedback.textContent = '';
    formFeedback.classList.remove('is-success', 'is-error');
  }

  if (!hasValidEndpoint) {
    event.preventDefault();

    if (formFeedback) {
      formFeedback.innerHTML = 'Não foi possível enviar pelo formulário no momento. <a href="https://wa.me/5511968441731" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>.';
      formFeedback.classList.add('is-error');
      formFeedback.hidden = false;
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }

    return;
  }

  event.preventDefault();

  try {
    const formData = new FormData(form);
    const formEncoding = (form.enctype || '').toLowerCase();
    const useMultipart = formEncoding.includes('multipart/form-data');
    const requestBody = useMultipart ? formData : new URLSearchParams(formData);

    const requestHeaders = useMultipart
      ? { Accept: 'application/json' }
      : {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        };

    const response = await fetch(formEndpoint, {
      method: 'POST',
      body: requestBody,
      headers: requestHeaders,
    });

    if (!response.ok) {
      throw new Error('Falha no envio.');
    }

    form.reset();

    if (formFeedback) {
      formFeedback.textContent = 'Solicitação enviada com sucesso. Em breve entraremos em contato.';
      formFeedback.classList.add('is-success');
      formFeedback.hidden = false;
    }
  } catch (error) {
    if (hasValidEndpoint && !form.dataset.nativeSubmitted) {
      if (formFeedback) {
        formFeedback.textContent = 'Falha no envio automático. Tentando envio alternativo...';
        formFeedback.classList.add('is-error');
        formFeedback.hidden = false;
      }

      form.dataset.nativeSubmitted = 'true';
      HTMLFormElement.prototype.submit.call(form);
      return;
    }

    if (formFeedback) {
      formFeedback.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
      formFeedback.classList.add('is-error');
      formFeedback.hidden = false;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
