const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageLockPath = path.join(projectRoot, 'package-lock.json');

const skipBump = process.env.SKIP_VERSION_BUMP === '1';
const bumpMode = (process.env.DESKTOP_VERSION_BUMP || 'patch').toLowerCase();
const explicitVersion = process.env.DESKTOP_VERSION;

if (skipBump || bumpMode === 'none') {
  console.log('Skipped desktop version bump.');
  process.exit(0);
}

const packageJson = readJson(packageJsonPath);
const currentVersion = packageJson.version;
const nextVersion = explicitVersion || bumpVersion(currentVersion, bumpMode);

assertStableVersion(nextVersion, 'DESKTOP_VERSION');

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

if (fs.existsSync(packageLockPath)) {
  const packageLock = readJson(packageLockPath);
  packageLock.version = nextVersion;

  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = nextVersion;
  }

  writeJson(packageLockPath, packageLock);
}

console.log(`Bumped desktop package version: ${currentVersion} -> ${nextVersion}`);

function bumpVersion(version, mode) {
  assertStableVersion(version, 'package.json version');

  const [major, minor, patch] = version.split('.').map((part) => Number(part));

  if (mode === 'major') {
    return `${major + 1}.0.0`;
  }

  if (mode === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  if (mode === 'patch') {
    return `${major}.${minor}.${patch + 1}`;
  }

  throw new Error(`Unsupported DESKTOP_VERSION_BUMP "${mode}". Use patch, minor, major, or none.`);
}

function assertStableVersion(version, label) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`${label} must be a stable semver version like 0.1.1.`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
