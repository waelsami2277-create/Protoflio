(() => {
  const newsGrid = document.querySelector('#news-grid');
  const moreButton = document.querySelector('#news-more');
  const items = Array.isArray(window.portfolioNewsItems) ? window.portfolioNewsItems : [];
  const initialLimit = 3;
  const platforms = {
    youtube: { label: 'YouTube', mark: '▶' }, instagram: { label: 'Instagram', mark: '◎' },
    linkedin: { label: 'LinkedIn', mark: 'in' }, facebook: { label: 'Facebook', mark: 'f' },
    tiktok: { label: 'TikTok', mark: '♪' }, x: { label: 'X', mark: 'X' },
    social: { label: 'Social', mark: '↗' }
  };

  const detectSocialPlatform = (url) => {
    try {
      const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be' || host.endsWith('youtube.com')) return 'youtube';
      if (host.endsWith('instagram.com')) return 'instagram';
      if (host.endsWith('linkedin.com')) return 'linkedin';
      if (host === 'fb.watch' || host.endsWith('facebook.com')) return 'facebook';
      if (host.endsWith('tiktok.com')) return 'tiktok';
      if (host === 'x.com' || host.endsWith('twitter.com')) return 'x';
    } catch (_) {}
    return 'social';
  };

  const getYouTubeId = (url) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      let id = '';
      if (host === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      if (host.endsWith('youtube.com')) {
        id = parsed.searchParams.get('v') || '';
        if (!id) {
          const parts = parsed.pathname.split('/').filter(Boolean);
          if (['embed', 'shorts', 'live'].includes(parts[0])) id = parts[1] || '';
        }
      }
      return /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
    } catch (_) { return null; }
  };

  const valueFor = (value, language) => value && typeof value === 'object'
    ? (value[language] || value.ar || value.en || '') : String(value || '');

  const localizedText = (tagName, value, className) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    ['ar', 'en'].forEach((language) => {
      const span = document.createElement('span');
      span.className = language === 'ar' ? 'inline-ar' : 'inline-en';
      span.lang = language;
      span.textContent = valueFor(value, language);
      element.append(span);
    });
    return element;
  };

  const platformBadge = (platform) => {
    const details = platforms[platform] || platforms.social;
    const badge = document.createElement('span');
    badge.className = `news-platform news-platform-${platform}`;
    const mark = document.createElement('b');
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = details.mark;
    badge.append(mark, document.createTextNode(details.label));
    return badge;
  };

  const SocialMediaEmbed = (url, title, platform) => {
    const preview = document.createElement('div');
    preview.className = 'news-preview';
    const youtubeId = platform === 'youtube' ? getYouTubeId(url) : null;
    if (youtubeId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
      iframe.title = valueFor(title, 'ar') || 'YouTube video';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      preview.append(iframe);
      return preview;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'news-preview-link';
    link.setAttribute('aria-label', `Open ${(platforms[platform] || platforms.social).label} post`);
    const name = document.createElement('strong');
    name.textContent = (platforms[platform] || platforms.social).label;
    link.append(platformBadge(platform), name, localizedText('span', { ar: 'مشاهدة المنشور', en: 'View post' }));
    preview.append(link);
    return preview;
  };

  const formatDate = (date, language) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-JO' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(parsed);
  };

  const createNewsCard = (item, index) => {
    const platform = item.platform || detectSocialPlatform(item.url);
    const article = document.createElement('article');
    article.className = 'news-card reveal';
    article.dataset.newsIndex = String(index);
    if (index >= initialLimit) article.hidden = true;
    article.append(SocialMediaEmbed(item.url, item.title, platform));
    const content = document.createElement('div');
    content.className = 'news-card-content';
    content.append(platformBadge(platform), localizedText('h3', item.title), localizedText('p', item.description));
    const footer = document.createElement('div');
    footer.className = 'news-card-footer';
    const time = document.createElement('time');
    time.dateTime = item.date;
    time.append(localizedText('span', { ar: formatDate(item.date, 'ar'), en: formatDate(item.date, 'en') }));
    const external = document.createElement('a');
    external.href = item.url;
    external.target = '_blank';
    external.rel = 'noopener noreferrer';
    external.className = 'news-external';
    external.setAttribute('aria-label', `Open ${(platforms[platform] || platforms.social).label} post in a new tab`);
    external.textContent = '↗';
    footer.append(time, external);
    content.append(footer);
    article.append(content);
    return article;
  };

  if (newsGrid) {
    items.forEach((item, index) => newsGrid.append(createNewsCard(item, index)));
    if (!items.length) newsGrid.hidden = true;
  }
  if (moreButton && items.length > initialLimit) {
    moreButton.hidden = false;
    moreButton.addEventListener('click', () => {
      const expanded = moreButton.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('[data-news-index]').forEach((card, index) => {
        if (index >= initialLimit) card.hidden = expanded;
      });
      moreButton.setAttribute('aria-expanded', String(!expanded));
      moreButton.querySelector('.inline-ar').textContent = expanded ? 'عرض المزيد' : 'عرض أقل';
      moreButton.querySelector('.inline-en').textContent = expanded ? 'Show more' : 'Show less';
    });
  }
  window.portfolioNews = { detectSocialPlatform, getYouTubeId, SocialMediaEmbed };
})();
