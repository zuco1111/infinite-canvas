const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const releaseDir = path.join(projectRoot, 'release');
const packageJson = readJson(path.join(projectRoot, 'package.json'));
const version = packageJson.version;
const productName = 'Infinite Canvas';
const safeProductName = 'Infinite-Canvas';

const artifactRules = [
  { from: 'mac-x64', to: 'Mac-Intel', extensions: ['dmg', 'zip'] },
  { from: 'mac-arm64', to: 'Mac-AppleSilicon', extensions: ['dmg', 'zip'] },
  { from: 'win-x64', to: 'Windows', extensions: ['exe', 'zip'] },
];

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`package.json version must be a stable semver version, got "${version}".`);
}

if (!fs.existsSync(releaseDir)) {
  console.log('No release directory found; skipped desktop artifact rename.');
  process.exit(0);
}

const replacements = new Map();
const renamed = [];

for (const rule of artifactRules) {
  for (const extension of rule.extensions) {
    const sourceName = `${productName}-${version}-${rule.from}.${extension}`;
    const targetName = `${productName}-${version}-${rule.to}.${extension}`;

    if (renameIfExists(sourceName, targetName)) {
      renamed.push(`${sourceName} -> ${targetName}`);
    }

    const sourceBlockmapName = `${sourceName}.blockmap`;
    const targetBlockmapName = `${targetName}.blockmap`;

    if (renameIfExists(sourceBlockmapName, targetBlockmapName)) {
      renamed.push(`${sourceBlockmapName} -> ${targetBlockmapName}`);
    }

    addMetadataReplacements(replacements, rule.from, rule.to, extension);
  }
}

updateMetadataFiles(replacements);

if (renamed.length) {
  console.log(`Renamed ${renamed.length} desktop artifact(s).`);
  renamed.forEach((entry) => console.log(`- ${entry}`));
} else {
  console.log('No desktop artifacts needed renaming.');
}

function renameIfExists(sourceName, targetName) {
  const sourcePath = path.join(releaseDir, sourceName);
  const targetPath = path.join(releaseDir, targetName);

  if (!fs.existsSync(sourcePath)) return false;

  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { force: true });
  }

  fs.renameSync(sourcePath, targetPath);
  return true;
}

function updateMetadataFiles(replacementMap) {
  for (const entry of fs.readdirSync(releaseDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.yml')) continue;

    const filePath = path.join(releaseDir, entry.name);
    const original = fs.readFileSync(filePath, 'utf8');
    let next = original;

    for (const [sourceName, targetName] of replacementMap) {
      next = next.split(sourceName).join(targetName);
    }

    if (next !== original) {
      fs.writeFileSync(filePath, next);
      console.log(`Updated desktop artifact metadata: ${entry.name}`);
    }
  }
}

function addMetadataReplacements(replacementMap, sourcePlatform, targetPlatform, extension) {
  const sourceNames = [
    `${productName}-${version}-${sourcePlatform}.${extension}`,
    `${safeProductName}-${version}-${sourcePlatform}.${extension}`,
  ];
  const targetName = `${productName}-${version}-${targetPlatform}.${extension}`;

  for (const sourceName of sourceNames) {
    replacementMap.set(sourceName, targetName);
    replacementMap.set(`${sourceName}.blockmap`, `${targetName}.blockmap`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
