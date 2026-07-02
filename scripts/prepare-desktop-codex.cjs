const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(projectRoot, 'build', 'desktop-codex');
const codexPackageRoot = path.join(projectRoot, 'node_modules', '@openai', 'codex');
const codexPackageJson = path.join(codexPackageRoot, 'package.json');

const codexVersion = JSON.parse(fs.readFileSync(codexPackageJson, 'utf8')).version;

const targets = [
  {
    id: 'darwin-arm64',
    packageName: '@openai/codex-darwin-arm64',
    version: `${codexVersion}-darwin-arm64`,
  },
  {
    id: 'darwin-x64',
    packageName: '@openai/codex-darwin-x64',
    version: `${codexVersion}-darwin-x64`,
  },
  {
    id: 'win32-x64',
    packageName: '@openai/codex-win32-x64',
    version: `${codexVersion}-win32-x64`,
  },
];

fs.rmSync(outputRoot, { recursive: true, force: true });

copyDirectory(
  codexPackageRoot,
  path.join(outputRoot, 'common', 'node_modules', '@openai', 'codex'),
);

for (const target of targets) {
  const targetDirectory = path.join(
    outputRoot,
    target.id,
    'node_modules',
    '@openai',
    path.basename(target.packageName),
  );
  packPlatformPackage(`@openai/codex@${target.version}`, targetDirectory);
}

function packPlatformPackage(spec, targetDirectory) {
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'infinite-canvas-codex-'));
  const extractDirectory = path.join(tempDirectory, 'extract');

  fs.mkdirSync(extractDirectory, { recursive: true });
  try {
    const stdout = execFileSync(
      'npm',
      ['pack', spec, '--pack-destination', tempDirectory, '--silent'],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    );
    const tarball = path.join(tempDirectory, stdout.trim().split(/\r?\n/).pop());
    execFileSync('tar', ['-xzf', tarball, '-C', extractDirectory], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    copyDirectory(path.join(extractDirectory, 'package'), targetDirectory);
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

function copyDirectory(source, target) {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}
