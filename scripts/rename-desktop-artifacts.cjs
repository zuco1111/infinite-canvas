const fs = require('node:fs');
const crypto = require('node:crypto');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const releaseDir = path.join(projectRoot, 'release');
const packageJson = readJson(path.join(projectRoot, 'package.json'));
const version = packageJson.version;
const productName = 'Infinite Canvas';
const safeProductName = 'Infinite-Canvas';

const artifactRules = [
  {
    from: 'mac-x64',
    to: 'Mac-Intel',
    extensions: ['dmg', 'zip'],
    volumeTitle: `${productName} ${version}-Mac-Intel`,
  },
  {
    from: 'mac-arm64',
    to: 'Mac-AppleSilicon',
    extensions: ['dmg', 'zip'],
    volumeTitle: `${productName} ${version}-Mac-AppleSilicon`,
  },
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

    if (extension === 'dmg' && rule.volumeTitle) {
      ensureDmgVolumeTitle(path.join(releaseDir, targetName), rule.volumeTitle);
    }
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

function ensureDmgVolumeTitle(dmgPath, volumeTitle) {
  if (!fs.existsSync(dmgPath)) return;
  if (process.platform !== 'darwin') {
    console.log(`Skipped DMG volume title check outside macOS: ${path.basename(dmgPath)}`);
    return;
  }

  const currentTitle = readDmgVolumeTitle(dmgPath);
  if (currentTitle === volumeTitle) return;

  setDmgVolumeTitle(dmgPath, volumeTitle);
  removeStaleBlockmap(dmgPath);
  updateArtifactMetadata(path.basename(dmgPath), dmgPath);
}

function readDmgVolumeTitle(dmgPath) {
  if (process.platform !== 'darwin') return null;

  let attachedDevice = null;

  try {
    const attachOutput = execFileSync(
      'hdiutil',
      ['attach', '-readonly', '-noverify', '-nobrowse', dmgPath],
      { encoding: 'utf8' },
    );
    const mountInfo = parseMountInfo(attachOutput);
    attachedDevice = mountInfo.device;
    return readVolumeName(mountInfo.device);
  } finally {
    if (attachedDevice) {
      execFileSync('hdiutil', ['detach', attachedDevice, '-force'], { stdio: 'ignore' });
    }
  }
}

function setDmgVolumeTitle(dmgPath, volumeTitle) {
  if (process.platform !== 'darwin') {
    console.log(`Skipped DMG volume title update outside macOS: ${path.basename(dmgPath)}`);
    return;
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'infinite-canvas-dmg-title-'));
  const readWriteOutput = path.join(workDir, 'readwrite.dmg');
  const compressedOutput = path.join(workDir, 'compressed.dmg');
  let attachedDevice = null;

  try {
    execFileSync('hdiutil', ['convert', dmgPath, '-format', 'UDRW', '-o', readWriteOutput], {
      stdio: 'ignore',
    });

    const readWriteDmg = resolveDmgOutput(readWriteOutput);
    const attachOutput = execFileSync(
      'hdiutil',
      ['attach', '-readwrite', '-noverify', '-nobrowse', readWriteDmg],
      { encoding: 'utf8' },
    );
    const mountInfo = parseMountInfo(attachOutput);
    attachedDevice = mountInfo.device;

    execFileSync('diskutil', ['rename', mountInfo.device, volumeTitle], { stdio: 'ignore' });
    execFileSync('hdiutil', ['detach', attachedDevice], { stdio: 'ignore' });
    attachedDevice = null;

    execFileSync(
      'hdiutil',
      [
        'convert',
        readWriteDmg,
        '-format',
        'UDZO',
        '-imagekey',
        'zlib-level=9',
        '-o',
        compressedOutput,
      ],
      { stdio: 'ignore' },
    );

    fs.renameSync(resolveDmgOutput(compressedOutput), dmgPath);
    console.log(`Updated DMG volume title: ${path.basename(dmgPath)} -> ${volumeTitle}`);
  } finally {
    if (attachedDevice) {
      execFileSync('hdiutil', ['detach', attachedDevice, '-force'], { stdio: 'ignore' });
    }
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function readVolumeName(device) {
  const plist = execFileSync('diskutil', ['info', '-plist', device], { encoding: 'utf8' });
  const match = plist.match(/<key>VolumeName<\/key>\s*<string>([^<]*)<\/string>/);

  if (!match) {
    throw new Error(`Cannot read volume name for ${device}.`);
  }

  return decodeXml(match[1]);
}

function parseMountInfo(output) {
  const line = output
    .split(/\r?\n/)
    .find((entry) => entry.includes('/dev/disk') && entry.includes('/Volumes/'));

  if (!line) {
    throw new Error(`Cannot find mounted DMG volume in hdiutil output:\n${output}`);
  }

  const deviceMatch = line.match(/^(\/dev\/disk\S+)/);
  const mountPathMatch = line.match(/(\/Volumes\/.+)$/);

  if (!deviceMatch || !mountPathMatch) {
    throw new Error(`Cannot parse mounted DMG volume line: ${line}`);
  }

  return { device: deviceMatch[1], mountPath: mountPathMatch[1] };
}

function removeStaleBlockmap(dmgPath) {
  const blockmapPath = `${dmgPath}.blockmap`;
  if (!fs.existsSync(blockmapPath)) return;

  fs.rmSync(blockmapPath, { force: true });
  console.log(`Removed stale DMG blockmap: ${path.basename(blockmapPath)}`);
}

function updateArtifactMetadata(artifactName, artifactPath) {
  const size = fs.statSync(artifactPath).size;
  const sha512 = crypto.createHash('sha512').update(fs.readFileSync(artifactPath)).digest('base64');
  const pattern = new RegExp(
    `(  - url: ${escapeRegExp(artifactName)}\\n    sha512: )[^\\n]+(\\n    size: )\\d+`,
    'g',
  );

  for (const entry of fs.readdirSync(releaseDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.yml')) continue;

    const filePath = path.join(releaseDir, entry.name);
    const original = fs.readFileSync(filePath, 'utf8');
    const next = original.replace(pattern, `$1${sha512}$2${size}`);

    if (next !== original) {
      fs.writeFileSync(filePath, next);
      console.log(`Updated desktop artifact metadata checksum: ${entry.name}`);
    }
  }
}

function resolveDmgOutput(outputPath) {
  if (fs.existsSync(outputPath)) return outputPath;

  const withExtension = `${outputPath}.dmg`;
  if (fs.existsSync(withExtension)) return withExtension;

  throw new Error(`Expected hdiutil output was not created: ${outputPath}`);
}

function decodeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
