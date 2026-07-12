const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  throw new Error('Renderer dist is missing. Run npm run build:renderer first.');
}

const forbiddenFiles = [
  path.join(dist, 'design-lab.html'),
  path.join(dist, 'design-lab-preview.html'),
];
const forbiddenMarkers = [
  'src/design-lab/',
  'design-lab-root',
  'design-lab-preview-root',
  'DesignLabCatalog',
];

for (const file of forbiddenFiles) {
  if (fs.existsSync(file)) {
    throw new Error(`Design Lab entered the formal renderer build: ${path.relative(root, file)}`);
  }
}

const textExtensions = new Set(['.css', '.html', '.js', '.map']);
const files = walk(dist).filter((file) => textExtensions.has(path.extname(file)));

for (const file of files) {
  const contents = fs.readFileSync(file, 'utf8');
  const marker = forbiddenMarkers.find((candidate) => contents.includes(candidate));
  if (marker) {
    throw new Error(
      `Design Lab marker ${JSON.stringify(marker)} entered ${path.relative(root, file)}`,
    );
  }
}

console.log('Design Lab is excluded from the formal renderer build.');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
