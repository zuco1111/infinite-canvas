const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packageJson = readJson(path.join(projectRoot, 'package.json'));
const currentVersion = packageJson.version;
const releaseDir = path.join(projectRoot, 'release');
const productName = 'Infinite Canvas';
const artifactPattern = new RegExp(`^${escapeRegExp(productName)}-(\\d+\\.\\d+\\.\\d+)-.+`);

if (!/^\d+\.\d+\.\d+$/.test(currentVersion)) {
  throw new Error(`package.json version must be a stable semver version, got "${currentVersion}".`);
}

if (!fs.existsSync(releaseDir)) {
  console.log('No release directory found; skipped old desktop package cleanup.');
  process.exit(0);
}

const removedFiles = [];

for (const entry of fs.readdirSync(releaseDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;

  const match = entry.name.match(artifactPattern);
  if (!match || match[1] === currentVersion) continue;

  const filePath = path.join(releaseDir, entry.name);
  fs.rmSync(filePath, { force: true });
  removedFiles.push(entry.name);
}

if (removedFiles.length) {
  console.log(
    `Removed ${removedFiles.length} old desktop package artifact(s); kept version ${currentVersion}.`,
  );
  removedFiles.forEach((fileName) => console.log(`- ${fileName}`));
} else {
  console.log(`No old desktop package artifacts found; kept version ${currentVersion}.`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
