const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of ['index.html', '1.html', '2.html', '3.html', '4.html', '5.html', '6.html']) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}

for (const name of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest']) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}

for (const directory of ['assets', 'css', 'js']) {
  fs.cpSync(path.join(root, directory), path.join(out, directory), { recursive: true });
}

console.log('Static site built in dist/');
