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
    document.title = english ? 'Wael Alfetyani | Business Technology Portfolio' : 'وائل الفتياني | Wael Alfetyani Portfolio';
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

  const certificateRail = document.querySelector('.certificate-list');
  if (certificateRail) {
    const certificateCards = [...certificateRail.querySelectorAll('.certificate-card')];
    let certificateTimer;
    let certificatePaused = false;
    let activeCertificateIndex = 0;
    const pauseCertificateRail = () => { certificatePaused = true; window.clearInterval(certificateTimer); };
    const showCertificate = (index, smooth = true) => {
      activeCertificateIndex = (index + certificateCards.length) % certificateCards.length;
      certificateCards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === activeCertificateIndex));
      const card = certificateCards[activeCertificateIndex];
      if (!card) return;
      certificateRail.scrollTo({
        left: card.offsetLeft - ((certificateRail.clientWidth - card.offsetWidth) / 2),
        behavior: smooth ? 'smooth' : 'auto'
      });
    };
    const advanceCertificates = () => {
      if (certificatePaused || document.hidden) return;
      showCertificate(activeCertificateIndex + 1);
    };
    const startCertificateRail = () => {
      window.clearInterval(certificateTimer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      certificateTimer = window.setInterval(advanceCertificates, 3000);
    };
    certificateCards.forEach((card, index) => {
      card.tabIndex = 0;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-label', `Certificate ${index + 1} of ${certificateCards.length}`);
      card.addEventListener('click', () => showCertificate(index));
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        showCertificate(index);
      });
    });
    ['mouseenter', 'focusin', 'pointerdown', 'touchstart'].forEach((eventName) => certificateRail.addEventListener(eventName, pauseCertificateRail, { passive: true }));
    ['mouseleave', 'focusout', 'pointerup', 'touchend'].forEach((eventName) => certificateRail.addEventListener(eventName, () => { certificatePaused = false; startCertificateRail(); }, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !certificatePaused) startCertificateRail(); });
    showCertificate(0, false);
    startCertificateRail();
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

  const header = document.querySelector('.site-header');
  if (header) {
    let lastScrollY = window.scrollY;
    let hasScrolled = false;
    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY + 2;
      const scrollingUp = currentScrollY < lastScrollY - 2;
      if (scrollingDown && currentScrollY > 48) hasScrolled = true;
      if (scrollingUp || currentScrollY <= 48) hasScrolled = false;
      header.classList.toggle('section-hidden', !hasScrolled);
      lastScrollY = currentScrollY;
    };
    header.classList.add('section-hidden');
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    window.addEventListener('resize', () => { lastScrollY = window.scrollY; });
  }

  document.querySelector('#year').textContent = new Date().getFullYear();
})();
