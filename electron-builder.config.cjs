const fs = require('node:fs');
const path = require('node:path');

const codexPackages = {
  darwin: {
    arm64: '@openai/codex-darwin-arm64',
    x64: '@openai/codex-darwin-x64',
  },
  win32: {
    x64: '@openai/codex-win32-x64',
  },
};

module.exports = {
  appId: 'com.zuco.infinitecanvas',
  productName: 'Infinite Canvas',
  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
  directories: {
    buildResources: 'build-resources',
    output: 'release',
  },
  files: [
    'package.json',
    'dist/**/*',
    'dist-electron/**/*',
    '!node_modules/**/*',
    '!src/**/*',
    '!electron/**/*',
    '!docs/**/*',
    '!tests/**/*',
    '!test-results/**/*',
    '!coverage/**/*',
    '!playwright-report/**/*',
  ],
  asar: true,
  npmRebuild: false,
  mac: {
    category: 'public.app-category.graphics-design',
    icon: 'build-resources/icon.icns',
    identity: null,
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
  },
  win: {
    icon: 'build-resources/icon.ico',
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'zip', arch: ['x64'] },
    ],
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: 'always',
    shortcutName: 'Infinite Canvas',
  },
  afterPack: async (context) => {
    copyCodexResources(context);
  },
};

function copyCodexResources(context) {
  const platform = context.electronPlatformName;
  const arch = archName(context.arch);
  const packageName = codexPackages[platform]?.[arch];

  if (!packageName) return;

  const resourcesDirectory = resolveResourcesDirectory(context);
  const codexOutputRoot = path.join(resourcesDirectory, 'node_modules', '@openai');
  const preparedRoot = path.join(__dirname, 'build', 'desktop-codex');
  const commonSource = path.join(preparedRoot, 'common', 'node_modules', '@openai', 'codex');
  const platformSource = path.join(
    preparedRoot,
    `${platform}-${arch}`,
    'node_modules',
    '@openai',
    path.basename(packageName),
  );

  copyDirectory(commonSource, path.join(codexOutputRoot, 'codex'));
  copyDirectory(platformSource, path.join(codexOutputRoot, path.basename(packageName)));
  console.log(`  • copied Codex CLI resources  platform=${platform} arch=${arch}`);
}

function resolveResourcesDirectory(context) {
  if (context.electronPlatformName === 'darwin') {
    return path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.app`,
      'Contents',
      'Resources',
    );
  }

  return path.join(context.appOutDir, 'resources');
}

function archName(arch) {
  const names = {
    0: 'ia32',
    1: 'x64',
    2: 'armv7l',
    3: 'arm64',
    4: 'universal',
  };
  return names[arch] || String(arch);
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing prepared Codex resource: ${source}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}
