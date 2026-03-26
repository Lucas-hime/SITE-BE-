const header = document.querySelector('.site-header');
const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');

const handleHeaderState = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
};

handleHeaderState();
window.addEventListener('scroll', handleHeaderState, { passive: true });


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
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('active');
      menuOverlay.hidden = true;
      document.body.style.overflow = '';
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay || '0';
      entry.target.style.transitionDelay = `${delay}s`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach((el) => observer.observe(el));

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  if (!event.currentTarget.checkValidity()) return;
  event.preventDefault();
  window.alert('Solicitação enviada.');
});
