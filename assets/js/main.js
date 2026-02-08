document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-open-icon');
  const closeIcon = document.getElementById('menu-close-icon');

  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', !open);
      openIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });

    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }

  // Navbar solid background on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal — enable hidden state then observe
  const reveals = document.querySelectorAll('.scroll-reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  }
});
