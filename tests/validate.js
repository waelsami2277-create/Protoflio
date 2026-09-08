const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const rel of ['index.html', 'css/app.css', 'js/navigation.js']) {
  assert(fs.existsSync(path.join(root, rel)), `Missing ${rel}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/navigation.js'), 'utf8');

for (const id of ['home', 'about', 'journey', 'impact', 'projects', 'contact']) {
  assert(html.includes(`id="${id}"`), `Missing #${id} website section`);
}
assert((html.match(/class="project-card reveal"/g) || []).length === 8, 'Expected exactly 8 project cards');
assert(html.includes('site-header') && html.includes('site-nav'), 'Website navigation is missing');
assert(html.includes('LinkedIn') && html.includes('GitHub'), 'Contact links are missing');
assert(css.includes('@media (max-width: 620px)'), 'Mobile responsive styles are missing');
assert(js.includes('IntersectionObserver'), 'Scroll interactions are missing');

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

