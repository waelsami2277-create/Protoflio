(() => {
  const splash = document.querySelector('#splash-screen');

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a')];

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  const englishButton = document.querySelector('.english-hotspot');
  const languageLabels = {
    ar: ['الرئيسية', 'عني', 'المسار', 'المشاريع', 'تواصل'],
    en: ['Home', 'About', 'Journey', 'Projects', 'Contact']
  };

  const currentSectionHash = () => {
    const sections = [...document.querySelectorAll('#home, #about, #journey, #projects, #contact')];
    const closest = sections.reduce((best, section) => {
      const distance = Math.abs(section.getBoundingClientRect().top);
      return !best || distance < best.distance ? { section, distance } : best;
    }, null);
    return closest ? `#${closest.section.id}` : (window.location.hash || '#home');
  };

  const alignSectionAfterLanguageChange = (targetHash) => {
    const safeHash = document.querySelector(targetHash) ? targetHash : '#home';
    history.replaceState(null, '', safeHash);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelector(safeHash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }));
  };

  const setLanguage = (language, targetHash = currentSectionHash()) => {
    const english = language === 'en';
    document.body.classList.toggle('language-en', english);
    document.documentElement.lang = english ? 'en' : 'ar';
    document.documentElement.dir = english ? 'ltr' : 'rtl';
    document.title = english ? 'Wael Alfetyani | Technology & Business Innovation' : 'وائل الفتياني | التكنولوجيا وابتكار الأعمال';
    englishButton?.setAttribute('aria-pressed', String(english));
    navLinks.forEach((link, index) => { link.textContent = languageLabels[language][index]; });
    try { localStorage.setItem('portfolio-language', language); } catch (_) {}
    alignSectionAfterLanguageChange(targetHash);
  };

  englishButton?.addEventListener('click', () => {
    englishButton.classList.remove('is-pressed');
    requestAnimationFrame(() => englishButton.classList.add('is-pressed'));
    setLanguage('en', '#home');
    window.setTimeout(() => englishButton.classList.remove('is-pressed'), 650);
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.language, window.location.hash || '#home');
      splash?.classList.add('is-leaving');
      window.setTimeout(() => splash?.remove(), 700);
    });
  });

  try {
    if (localStorage.getItem('portfolio-language') === 'en') setLanguage('en', window.location.hash || '#home');
  } catch (_) {}

  const discoverButton = document.querySelector('.discover-hotspot');
  discoverButton?.addEventListener('click', (event) => {
    event.preventDefault();
    if (discoverButton.classList.contains('is-activating')) return;

    const target = document.querySelector(discoverButton.getAttribute('href'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    discoverButton.classList.add('is-activating');

    window.setTimeout(() => {
      target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', discoverButton.getAttribute('href'));
      window.setTimeout(() => discoverButton.classList.remove('is-activating'), 700);
    }, reducedMotion ? 0 : 330);
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeaderVisibility = () => {
      const revealPoint = Math.min(window.innerHeight * 0.28, 240);
      header.classList.toggle('section-hidden', window.scrollY < revealPoint);
    };
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    window.addEventListener('resize', updateHeaderVisibility);
    updateHeaderVisibility();
  }

  document.querySelector('#year').textContent = new Date().getFullYear();
})();
