const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const releaseDir = path.join(projectRoot, 'release');
const packageJson = readJson(path.join(projectRoot, 'package.json'));
const version = packageJson.version;
const productName = 'Infinite Canvas';
const stableProductName = 'Infinite-Canvas';

const latestAliasRules = [
  {
    source: `${productName}-${version}-Mac-AppleSilicon.dmg`,
    alias: `${stableProductName}-Mac-AppleSilicon.dmg`,
  },
  {
    source: `${productName}-${version}-Mac-Intel.dmg`,
    alias: `${stableProductName}-Mac-Intel.dmg`,
  },
  {
    source: `${productName}-${version}-Windows.exe`,
    alias: `${stableProductName}-Windows.exe`,
  },
];

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`package.json version must be a stable semver version, got "${version}".`);
}

if (!fs.existsSync(releaseDir)) {
  console.log('No release directory found; skipped latest release aliases.');
  process.exit(0);
}

const copied = [];
const removed = [];

for (const rule of latestAliasRules) {
  const sourcePath = path.join(releaseDir, rule.source);
  const aliasPath = path.join(releaseDir, rule.alias);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, aliasPath);
    copied.push(`${rule.source} -> ${rule.alias}`);
    continue;
  }

  if (fs.existsSync(aliasPath)) {
    fs.rmSync(aliasPath, { force: true });
    removed.push(rule.alias);
  }
}

if (copied.length) {
  console.log(`Prepared ${copied.length} latest release alias artifact(s).`);
  copied.forEach((entry) => console.log(`- ${entry}`));
} else {
  console.log('No desktop installer artifacts found for latest release aliases.');
}

if (removed.length) {
  console.log(`Removed ${removed.length} stale latest release alias artifact(s).`);
  removed.forEach((entry) => console.log(`- ${entry}`));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
