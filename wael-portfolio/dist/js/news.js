(() => {
  const board = document.querySelector('#news-board');
  const slideHost = document.querySelector('#news-slide');
  const dotsHost = document.querySelector('#news-dots');
  const progressBar = document.querySelector('#news-progress-bar');
  const previousButton = document.querySelector('#news-prev');
  const nextButton = document.querySelector('#news-next');
  const items = Array.isArray(window.portfolioNewsItems) ? window.portfolioNewsItems : [];
  const AUTO_ROTATE_INTERVAL = 5000;
  let activeIndex = 0;
  let timer = null;
  let paused = false;
  let pointerStartX = null;

  const platforms = {
    youtube: { label: 'YouTube', mark: '▶' }, instagram: { label: 'Instagram', mark: '◎' },
    linkedin: { label: 'LinkedIn', mark: 'in' }, facebook: { label: 'Facebook', mark: 'f' },
    tiktok: { label: 'TikTok', mark: '♪' }, x: { label: 'X', mark: 'X' },
    vimeo: { label: 'Vimeo', mark: '▶' }, direct: { label: 'Video', mark: '▶' },
    social: { label: 'Social', mark: '↗' }
  };

  const detectSocialPlatform = (url) => {
    try {
      const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be' || host.endsWith('youtube.com')) return 'youtube';
      if (host.endsWith('vimeo.com')) return 'vimeo';
      if (host.endsWith('instagram.com')) return 'instagram';
      if (host.endsWith('linkedin.com') || host === 'lnkd.in') return 'linkedin';
      if (host === 'fb.watch' || host.endsWith('facebook.com')) return 'facebook';
      if (host.endsWith('tiktok.com')) return 'tiktok';
      if (host === 'x.com' || host.endsWith('twitter.com')) return 'x';
    } catch (_) {}
    return 'social';
  };

  const getYouTubeVideoId = (url) => {
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

  const getVimeoVideoId = (url) => {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (!host.endsWith('vimeo.com')) return null;
      const id = new URL(url).pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      return id || null;
    } catch (_) { return null; }
  };

  const getYouTubeEmbedUrl = (url) => {
    const id = getYouTubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  const getVimeoEmbedUrl = (url) => {
    const id = getVimeoVideoId(url);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  };

  const getInstagramEmbedUrl = (url) => {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.toLowerCase().replace(/^www\./, '').endsWith('instagram.com')) return null;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (!['p', 'reel', 'tv'].includes(parts[0]) || !parts[1]) return null;
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    } catch (_) { return null; }
  };

  const getDirectVideoType = (url) => {
    try {
      const pathname = new URL(url).pathname.toLowerCase();
      const match = pathname.match(/\.(mp4|webm|ogg|ogv|mov|m4v|m3u8)$/);
      return match ? (match[1] === 'm3u8' ? 'application/vnd.apple.mpegurl' : `video/${match[1] === 'ogv' ? 'ogg' : match[1]}`) : null;
    } catch (_) { return null; }
  };

  const localized = (item, key, language) => item[`${key}${language === 'ar' ? 'Ar' : 'En'}`] || item[`${key}Ar`] || item[`${key}En`] || '';
  const localizedSpan = (item, key, language) => {
    const span = document.createElement('span');
    span.className = language === 'ar' ? 'inline-ar' : 'inline-en';
    span.lang = language;
    span.textContent = localized(item, key, language);
    return span;
  };

  const platformDetails = (platform) => platforms[platform] || platforms.social;
  const addPlatformBadge = (parent, platform) => {
    const badge = document.createElement('span');
    badge.className = `news-platform news-platform-${platform}`;
    const mark = document.createElement('b');
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = platformDetails(platform).mark;
    badge.append(mark, document.createTextNode(platformDetails(platform).label));
    parent.append(badge);
  };

  const externalPreview = (item, platform) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'news-preview-link news-external-link';
    link.setAttribute('aria-label', `Open ${platformDetails(platform).label} video or post`);
    if (item.thumbnail) {
      const thumbnail = document.createElement('img');
      link.classList.add('news-image-link');
      thumbnail.className = 'news-media-image';
      thumbnail.src = item.thumbnail;
      thumbnail.alt = '';
      thumbnail.loading = 'lazy';
      link.append(thumbnail);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = `news-preview-placeholder news-preview-placeholder-${platform}`;
      placeholder.setAttribute('aria-hidden', 'true');
      const placeholderMark = document.createElement('b');
      placeholderMark.textContent = platformDetails(platform).mark;
      placeholder.append(placeholderMark);
      link.append(placeholder);
    }
    const action = document.createElement('span');
    action.className = 'news-preview-action';
    const actionText = platform === 'linkedin'
      ? { titleAr: 'فتح المشاركة على LinkedIn', titleEn: 'Open on LinkedIn' }
      : { titleAr: 'مشاهدة الفيديو أو المنشور', titleEn: 'View video or post' };
    action.append(localizedSpan(actionText, 'title', 'ar'), localizedSpan(actionText, 'title', 'en'));
    action.append(document.createTextNode(' ↗'));
    link.append(action);
    return link;
  };

  const SocialMediaEmbed = (item, platform) => {
    const preview = document.createElement('div');
    preview.className = 'news-preview';
    const embedUrl = platform === 'youtube'
      ? getYouTubeEmbedUrl(item.url)
      : platform === 'vimeo'
        ? getVimeoEmbedUrl(item.url)
        : platform === 'instagram'
          ? getInstagramEmbedUrl(item.url)
          : null;
    const directType = getDirectVideoType(item.url);
    if (embedUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = item.titleEn || item.titleAr || 'Social video';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('scrolling', 'no');
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      preview.append(iframe);
      return preview;
    }
    if (directType) {
      const video = document.createElement('video');
      video.src = item.url;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', item.titleEn || item.titleAr || 'Video');
      if (item.thumbnail) video.poster = item.thumbnail;
      preview.append(video);
      return preview;
    }
    preview.append(externalPreview(item, platform));
    return preview;
  };

  const formatDate = (date, language) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-JO' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).format(parsed);
  };

  const createSlide = (item) => {
    const platform = item.platform || detectSocialPlatform(item.url);
    const slide = document.createElement('article');
    slide.className = 'news-active-slide';
    slide.append(SocialMediaEmbed(item, platform));
    const content = document.createElement('div');
    content.className = 'news-slide-content';
    addPlatformBadge(content, platform);
    const title = document.createElement('h3');
    title.append(localizedSpan(item, 'title', 'ar'), localizedSpan(item, 'title', 'en'));
    content.append(title);
    const description = document.createElement('p');
    description.append(localizedSpan(item, 'description', 'ar'), localizedSpan(item, 'description', 'en'));
    content.append(description);
    const postText = localized(item, 'postText', 'ar') || localized(item, 'description', 'ar');
    const postTextEn = localized(item, 'postText', 'en') || localized(item, 'description', 'en');
    if (postText || postTextEn) {
      const postTextBlock = document.createElement('div');
      postTextBlock.className = 'news-post-text';
      const postTextLabel = document.createElement('span');
      postTextLabel.className = 'news-post-text-label';
      postTextLabel.append(localizedSpan({ titleAr: 'نص المنشور', titleEn: 'Post text' }, 'title', 'ar'), localizedSpan({ titleAr: 'نص المنشور', titleEn: 'Post text' }, 'title', 'en'));
      const postTextBody = document.createElement('p');
      postTextBody.append(localizedSpan({ titleAr: postText, titleEn: postTextEn }, 'title', 'ar'), localizedSpan({ titleAr: postText, titleEn: postTextEn }, 'title', 'en'));
      postTextBlock.append(postTextLabel, postTextBody);
      content.append(postTextBlock);
    }
    const footer = document.createElement('div');
    footer.className = 'news-card-footer';
    const time = document.createElement('time');
    time.dateTime = item.date;
    const dateItem = { titleAr: formatDate(item.date, 'ar'), titleEn: formatDate(item.date, 'en') };
    time.append(localizedSpan(dateItem, 'title', 'ar'), localizedSpan(dateItem, 'title', 'en'));
    const external = document.createElement('a');
    external.href = item.url;
    external.target = '_blank';
    external.rel = 'noopener noreferrer';
    external.className = 'news-external';
    external.setAttribute('aria-label', `Open ${platformDetails(platform).label} video or post in a new tab`);
    const externalLabel = platform === 'linkedin'
      ? { titleAr: 'فتح LinkedIn', titleEn: 'Open LinkedIn' }
      : { titleAr: 'فتح المصدر', titleEn: 'Open source' };
    external.append(localizedSpan(externalLabel, 'title', 'ar'), localizedSpan(externalLabel, 'title', 'en'), document.createTextNode(' ↗'));
    footer.append(time, external);
    content.append(footer);
    slide.append(content);
    return slide;
  };

  const clearTimer = () => { if (timer) { window.clearTimeout(timer); timer = null; } };
  const restartProgress = () => {
    if (!progressBar) return;
    progressBar.classList.remove('is-running');
    progressBar.style.animationDuration = `${AUTO_ROTATE_INTERVAL}ms`;
    void progressBar.offsetWidth;
    if (!paused && items.length > 1) progressBar.classList.add('is-running');
  };
  const scheduleTimer = () => {
    clearTimer();
    restartProgress();
    if (!paused && items.length > 1) timer = window.setTimeout(() => showSlide(activeIndex + 1), AUTO_ROTATE_INTERVAL);
  };
  const updateControls = () => {
    [...dotsHost.children].forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
      dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
    board?.setAttribute('aria-label', `News item ${activeIndex + 1} of ${items.length}`);
  };
  const showSlide = (index) => {
    if (!slideHost || !items.length) return;
    const nextIndex = (index + items.length) % items.length;
    const distance = (nextIndex - activeIndex + items.length) % items.length;
    const direction = distance === 0 || distance <= items.length / 2 ? 1 : -1;
    activeIndex = nextIndex;
    const slide = createSlide(items[activeIndex]);
    slide.style.setProperty('--news-slide-direction', direction);
    slideHost.replaceChildren(slide);
    requestAnimationFrame(() => slide.classList.add('is-visible'));
    updateControls();
    scheduleTimer();
  };
  const setPaused = (value) => {
    paused = value;
    board?.classList.toggle('is-paused', paused);
    if (paused) {
      clearTimer();
      progressBar?.classList.remove('is-running');
    } else scheduleTimer();
  };

  if (board && slideHost && dotsHost && items.length) {
    items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'news-dot';
      dot.setAttribute('aria-label', `Go to news item ${index + 1}`);
      dot.addEventListener('click', () => showSlide(index));
      dotsHost.append(dot);
    });
    previousButton?.addEventListener('click', () => showSlide(activeIndex - 1));
    nextButton?.addEventListener('click', () => showSlide(activeIndex + 1));
    board.addEventListener('mouseenter', () => setPaused(true));
    board.addEventListener('mouseleave', () => setPaused(board.matches(':focus-within')));
    board.addEventListener('focusin', () => setPaused(true));
    board.addEventListener('focusout', (event) => { if (!board.contains(event.relatedTarget)) setPaused(false); });
    board.addEventListener('pointerdown', (event) => { pointerStartX = event.clientX; });
    board.addEventListener('pointerup', (event) => {
      if (pointerStartX === null) return;
      const movement = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(movement) < 45) return;
      showSlide(activeIndex + (movement < 0 ? 1 : -1));
    });
    board.addEventListener('pointercancel', () => { pointerStartX = null; });
    document.addEventListener('visibilitychange', () => setPaused(document.hidden));
    showSlide(0);
  }

  window.addEventListener('beforeunload', clearTimer, { once: true });
  window.portfolioNews = { AUTO_ROTATE_INTERVAL, detectSocialPlatform, getYouTubeVideoId, getYouTubeEmbedUrl, getVimeoVideoId, getVimeoEmbedUrl, getInstagramEmbedUrl, getDirectVideoType, SocialMediaEmbed };
})();
