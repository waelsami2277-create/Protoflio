const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const rel of ['index.html', 'css/app.css', 'js/navigation.js', 'js/news.js', 'js/news-data.js']) {
  assert(fs.existsSync(path.join(root, rel)), `Missing ${rel}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/navigation.js'), 'utf8');
const newsJs = fs.readFileSync(path.join(root, 'js/news.js'), 'utf8');
const newsData = fs.readFileSync(path.join(root, 'js/news-data.js'), 'utf8');
try {
  new Function(js);
  new Function(newsJs);
  new Function(newsData);
} catch (error) {
  failures.push(`Navigation JavaScript has a syntax error: ${error.message}`);
}

for (const id of ['home', 'about', 'journey', 'projects', 'contact']) {
  assert(html.includes(`id="${id}"`), `Missing #${id} website section`);
}
assert((html.match(/class="project-card reveal"/g) || []).length === 8, 'Expected exactly 8 project cards');
for (const className of ['hero-built-section', 'about-built-section', 'journey-built-section', 'built-project-grid', 'built-contact-section']) {
  assert(html.includes(className), `Missing semantic HTML/CSS section: ${className}`);
}
assert((html.match(/class="inline-en"/g) || []).length >= 8, 'English localized content is incomplete');
assert((html.match(/class="inline-ar"/g) || []).length >= 8, 'Arabic localized content is incomplete');
assert(html.includes('site-header') && html.includes('site-nav'), 'Website navigation is missing');
assert(html.includes('about-linkedin-mark'), 'LinkedIn logo hotspot is missing from the about section');
assert(html.includes('LinkedIn') && html.includes('GitHub'), 'Contact links are missing');
assert(css.includes('@media (max-width: 620px)'), 'Mobile responsive styles are missing');
assert(css.includes('aspect-ratio: 1672 / 941') && css.includes('background-size: 100% auto'), 'Mobile about artwork must preserve its full aspect ratio');
assert(js.includes('IntersectionObserver'), 'Scroll interactions are missing');
assert(js.includes('updateHeaderVisibility'), 'Header scroll visibility behavior is missing');
assert(html.indexOf('id="news"') > html.indexOf('id="projects"'), 'News section must follow the Projects section');
assert(html.indexOf('id="news"') < html.indexOf('id="contact"'), 'News section must precede the Contact section');
assert(html.includes('js/news-data.js') && html.includes('js/news.js'), 'News scripts are not loaded');
assert(newsJs.includes('detectSocialPlatform') && newsJs.includes('getYouTubeVideoId') && newsJs.includes('getYouTubeEmbedUrl'), 'Social platform detection or YouTube conversion is missing');
assert(newsJs.includes("iframe.loading = 'lazy'"), 'YouTube embeds must be lazy loaded');
assert(newsJs.includes('getDirectVideoType') && newsJs.includes("createElement('video')"), 'Direct video URLs must render as video controls');
assert(newsJs.includes('getInstagramEmbedUrl') && newsJs.includes('instagram.com/${parts[0]}'), 'Instagram posts and reels must use official embeds');
assert(html.includes('news-board') && html.includes('news-prev') && html.includes('news-next'), 'News slider controls are missing');
assert(html.includes('news-strip') && newsJs.includes('createStripItem'), 'News visual thumbnail strip is missing');
assert(newsJs.includes('AUTO_ROTATE_INTERVAL = 5000') && newsJs.includes('setPaused'), 'News 5-second auto-rotation and pause behavior is missing');
assert(html.includes('news-progress-bar') && newsJs.includes('restartProgress'), 'News progress indicator is missing');
assert(newsData.includes('window.portfolioNewsItems'), 'News items must come from the data source');
assert((html.match(/class="certificate-card"/g) || []).length === 9, 'Certificate credential list must contain 9 items');
assert(html.includes('certificate-action') && html.includes('certificate-proof'), 'Certificate credentials need action buttons and preview details');
assert(css.includes('scroll-snap-type: x mandatory') && js.includes('advanceCertificates') && js.includes('setInterval(advanceCertificates, 3000)'), 'Certificate rail must auto-advance horizontally every 3 seconds');
for (const certificateAsset of ['gdg-on-campus-core-team.pdf', 'build-with-ai-ramadan.pdf', 'sql-for-data-analysis.pdf', 'icdl.jpg']) {
  assert(fs.existsSync(path.join(root, 'assets', 'certificates', certificateAsset)), `Missing certificate asset: ${certificateAsset}`);
}
assert(html.includes('<title>Wael S. Al-Fetyani | Business Information Technology | Technology &amp; Business Innovation</title>'), 'SEO title must identify Wael S. Al-Fetyani accurately');
assert(html.includes('application/ld+json') && html.includes('ProfilePage') && html.includes('Wael S. Al-Fetyani'), 'Person/ProfilePage structured data is incomplete');
assert(html.includes('og:title') && html.includes('og:image') && html.includes('twitter:title') && html.includes('twitter:image'), 'Social discovery metadata is incomplete');
assert(html.includes("Bachelor's Degree in Business Information Technology (BIT) — Zarqa University."), 'The official BIT degree must appear in the website');
assert(html.includes('Founder &amp; CEO — HYC Digital'), 'HYC Digital founder identity is missing');
assert(html.includes('Core Strengths') && html.includes('Business Analysis'), 'Core Strengths content is missing');
for (const outdatedTerm of ['Verified metrics', '92%', '88%', '95%', '85%', 'Management Information Systems']) {
  assert(!html.includes(outdatedTerm), `Outdated professional identity content remains: ${outdatedTerm}`);
}
assert(html.includes('/assets/favicon-192.png'), 'The homepage must advertise the square search-result favicon');
for (const faviconAsset of ['favicon-192.png', 'favicon-512.png']) {
  assert(fs.existsSync(path.join(root, 'assets', faviconAsset)), `Missing favicon asset: ${faviconAsset}`);
}
assert(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8').includes('OAI-SearchBot'), 'OAI-SearchBot must be allowed for AI search discovery');
assert(fs.existsSync(path.join(root, 'llms.txt')), 'llms.txt AI discovery summary is missing');

for (let i = 1; i <= 6; i += 1) {
  const legacy = fs.readFileSync(path.join(root, `${i}.html`), 'utf8');
  assert(legacy.includes('index.html#'), `Legacy page ${i} does not redirect into the website`);
}

if (failures.length) {
  console.error('Validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Validation passed: responsive portfolio website, six sections, and eight projects are present.');
