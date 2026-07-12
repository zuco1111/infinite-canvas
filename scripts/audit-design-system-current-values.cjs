#!/usr/bin/env node

const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = process.cwd();
const excludedProductionFiles = new Set([
  'src/shared/tokens/app.ts',
  'src/shared/tokens/canvas.ts',
  'src/styles/index.css',
]);
const productionInputPaths = [
  'src',
  'electron',
  'public',
  'index.html',
  'tailwind.config.ts',
  'postcss.config.cjs',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'package.json',
  'package-lock.json',
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    return entry.isFile() ? [absolutePath] : [];
  });
}

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function isProductionSource(filePath) {
  const file = relative(filePath);
  return (
    /\.(?:ts|tsx|css)$/.test(file) &&
    !file.startsWith('src/design-lab/') &&
    !/\.(?:test|spec)\.(?:ts|tsx)$/.test(file) &&
    !file.includes('/__tests__/')
  );
}

function sourceFiles() {
  return walk(path.join(root, 'src')).filter(isProductionSource).sort();
}

function sourceFileFor(filePath) {
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
}

function location(sourceFile, node) {
  const point = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return relative(sourceFile.fileName) + ':' + (point.line + 1);
}

function propertyName(node, sourceFile) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return node.getText(sourceFile);
}

function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function literalObject(node, sourceFile) {
  const value = unwrap(node);
  if (!value) return null;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isObjectLiteralExpression(value)) {
    return Object.fromEntries(
      value.properties
        .filter(ts.isPropertyAssignment)
        .map((property) => [
          propertyName(property.name, sourceFile),
          literalObject(property.initializer, sourceFile),
        ]),
    );
  }
  return { expression: value.getText(sourceFile) };
}

function exportedConst(filePath, variableName) {
  const sourceFile = sourceFileFor(filePath);
  let result = null;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) {
        result = literalObject(declaration.initializer, sourceFile);
      }
    }
  });
  if (result === null) throw new Error('Unable to read ' + variableName + ' from ' + filePath);
  return result;
}

function cssBlock(text, selector) {
  const selectorStart = text.indexOf(selector);
  if (selectorStart < 0) throw new Error('Missing CSS selector ' + selector);
  const open = text.indexOf('{', selectorStart);
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') depth -= 1;
    if (depth === 0) return text.slice(open + 1, index);
  }
  throw new Error('Unclosed CSS block ' + selector);
}

function cssVariables() {
  const text = fs.readFileSync(path.join(root, 'src/styles/index.css'), 'utf8');
  const read = (selector) =>
    Object.fromEntries(
      [...cssBlock(text, selector).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
        match[1],
        match[2].trim().replace(/\s+/g, ' '),
      ]),
    );
  return { light: read(':root'), dark: read('.dark') };
}

function addOccurrence(map, value, at) {
  const entry = map.get(value) || { count: 0, locations: [] };
  entry.count += 1;
  entry.locations.push(at);
  map.set(value, entry);
}

function entries(map) {
  return [...map]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([value, detail]) => ({ value, ...detail }));
}

function hardcodedColors(files) {
  const colors = new Map();
  const pattern = /#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)/g;
  for (const filePath of files) {
    if (excludedProductionFiles.has(relative(filePath))) continue;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(pattern)) {
        addOccurrence(
          colors,
          match[0].replace(/\s+/g, ' '),
          relative(filePath) + ':' + (index + 1),
        );
      }
    });
  }
  return entries(colors);
}

function collectClassStrings(files) {
  const classStrings = [];
  const seen = new Set();

  function collect(node, sourceFile, context) {
    if (!node) return;
    const value = unwrap(node);
    if (!value) return;
    if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
      const key = sourceFile.fileName + ':' + value.pos + ':' + value.end;
      if (!seen.has(key)) {
        seen.add(key);
        classStrings.push({ text: value.text, location: location(sourceFile, value), context });
      }
      return;
    }
    if (ts.isTemplateExpression(value)) {
      const parts = [value.head, ...value.templateSpans.map((span) => span.literal)];
      for (const part of parts) {
        if (part.text.trim()) {
          const key = sourceFile.fileName + ':' + part.pos + ':' + part.end;
          if (!seen.has(key)) {
            seen.add(key);
            classStrings.push({ text: part.text, location: location(sourceFile, part), context });
          }
        }
      }
      for (const span of value.templateSpans) collect(span.expression, sourceFile, context);
      return;
    }
    if (ts.isPropertyAssignment(value)) {
      collect(value.initializer, sourceFile, context);
      return;
    }
    if (ts.isObjectLiteralExpression(value)) {
      for (const property of value.properties) collect(property, sourceFile, context);
      return;
    }
    if (ts.isArrayLiteralExpression(value)) {
      for (const element of value.elements) collect(element, sourceFile, context);
      return;
    }
    if (ts.isConditionalExpression(value)) {
      collect(value.whenTrue, sourceFile, context);
      collect(value.whenFalse, sourceFile, context);
      return;
    }
    if (ts.isBinaryExpression(value)) {
      collect(value.left, sourceFile, context);
      collect(value.right, sourceFile, context);
      return;
    }
    if (ts.isCallExpression(value)) {
      for (const argument of value.arguments) collect(argument, sourceFile, context);
      return;
    }
    value.forEachChild((child) => collect(child, sourceFile, context));
  }

  for (const filePath of files.filter((file) => /\.(?:ts|tsx)$/.test(file))) {
    const sourceFile = sourceFileFor(filePath);
    function visit(node) {
      if (ts.isJsxAttribute(node)) {
        const name = node.name.getText(sourceFile);
        if (/className$/i.test(name)) {
          const initializer = node.initializer;
          collect(
            initializer && ts.isJsxExpression(initializer) ? initializer.expression : initializer,
            sourceFile,
            'jsx:' + name,
          );
        }
      }
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        /className$/i.test(node.name.text)
      ) {
        collect(node.initializer, sourceFile, 'variable:' + node.name.text);
      }
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(sourceFile);
        if (['cn', 'clsx', 'twMerge'].includes(callee)) {
          for (const argument of node.arguments) collect(argument, sourceFile, 'call:' + callee);
        }
      }
      node.forEachChild(visit);
    }
    visit(sourceFile);
  }
  return classStrings;
}

function classTokens(classStrings) {
  const tokens = new Map();
  for (const item of classStrings) {
    for (const token of item.text.split(/\s+/).filter(Boolean)) {
      addOccurrence(tokens, token, item.location);
    }
  }
  return tokens;
}

function classCategory(tokens, predicate) {
  const selected = new Map();
  for (const [token, detail] of tokens) {
    if (predicate(token)) selected.set(token, detail);
  }
  return entries(selected);
}

function utilityBody(token) {
  return token.split(':').at(-1).replace(/^!/, '');
}

function classInventory(classStrings) {
  const tokens = classTokens(classStrings);
  const byBody = (pattern) => classCategory(tokens, (token) => pattern.test(utilityBody(token)));
  const rawColorValue =
    /^(?:black|white|transparent|current|slate-\d+|gray-\d+|zinc-\d+|neutral-\d+|stone-\d+|red-\d+|orange-\d+|amber-\d+|yellow-\d+|lime-\d+|green-\d+|emerald-\d+|teal-\d+|cyan-\d+|sky-\d+|blue-\d+|indigo-\d+|violet-\d+|purple-\d+|fuchsia-\d+|pink-\d+|rose-\d+|\[#|\[rgb|\[hsl|\[color-mix)/;
  return {
    extraction: {
      stringLiterals: classStrings.length,
      uniqueTokens: tokens.size,
      tokenOccurrences: [...tokens.values()].reduce((sum, entry) => sum + entry.count, 0),
      contexts: [...new Set(classStrings.map((item) => item.context))].sort(),
    },
    arbitrary: classCategory(tokens, (token) => /[[(]/.test(token)),
    important: classCategory(tokens, (token) => utilityBody(token) !== token.split(':').at(-1)),
    rawColorUtilities: classCategory(tokens, (token) => {
      const match = utilityBody(token).match(
        /^(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|caret|accent)-(.+)$/,
      );
      return Boolean(match && rawColorValue.test(match[1]));
    }),
    spacing: byBody(
      /^(?:-)?(?:m[trblxy]?|p[trblxy]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left)-/,
    ),
    size: byBody(
      /^(?:size|[wh]|min-[wh]|max-[wh]|basis|aspect|grid-cols|grid-rows|col-span|row-span)-/,
    ),
    typography: byBody(
      /^(?:font|text|leading|tracking|whitespace|break|truncate|line-clamp|list)-/,
    ),
    radius: byBody(/^rounded(?:-|$)/),
    border: byBody(/^(?:border|outline|ring)(?:-|$)/),
    shadow: byBody(/^shadow(?:-|$)/),
    layer: byBody(/^(?:-)?z-/),
    opacityBlur: byBody(/^(?:opacity|blur|backdrop-blur|mix-blend)-/),
    motion: byBody(/^(?:transition|duration|ease|animate|delay|transform)(?:-|$)/),
    responsive: classCategory(tokens, (token) => /(?:^|:)(?:sm|md|lg|xl|2xl):/.test(token)),
    all: entries(tokens),
  };
}

function dynamicCssProperties(files) {
  const properties = new Map();
  for (const filePath of files.filter((file) => /\.(?:ts|tsx)$/.test(file))) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/\.style\.setProperty\(\s*['"](--[\w-]+)['"]/g)) {
        addOccurrence(properties, match[1], relative(filePath) + ':' + (index + 1));
      }
    });
  }
  return entries(properties);
}

function git(commandArgs) {
  return execFileSync('git', commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function createManifest() {
  const files = sourceFiles();
  const classStrings = collectClassStrings(files);
  const inputManifest = git(['ls-files', '-s', '--', ...productionInputPaths]);
  return {
    schemaVersion: 1,
    kind: 'design-system-current-style-values',
    sourceRevision: git(['rev-parse', 'HEAD']).trim(),
    productionInputTreeSha256: createHash('sha256').update(inputManifest).digest('hex'),
    generatedBy: 'scripts/audit-design-system-current-values.cjs',
    extractionNotes: [
      'Occurrences are source literal occurrences, not runtime rendered instances.',
      'Class values cover JSX props ending in className, variables ending in ClassName, and cn/clsx/twMerge string arguments.',
      'Dynamic runtime geometry and user content values remain explicit exceptions in INVENTORY.md.',
    ],
    sources: {
      productionTsx: files.filter((file) => file.endsWith('.tsx')).map(relative),
      appThemeTokens: exportedConst(path.join(root, 'src/shared/tokens/app.ts'), 'appThemeTokens'),
      canvasThemeTokens: exportedConst(
        path.join(root, 'src/shared/tokens/canvas.ts'),
        'canvasThemeTokens',
      ),
      canvasLegacyAliases: exportedConst(
        path.join(root, 'src/shared/tokens/canvas.ts'),
        'canvasTokens',
      ),
      cssVariables: cssVariables(),
      hardcodedColors: hardcodedColors(files),
      dynamicCssProperties: dynamicCssProperties(files),
      classes: classInventory(classStrings),
    },
  };
}

const manifest = createManifest();
const sectionIndex = process.argv.indexOf('--section');
const sectionName = sectionIndex >= 0 ? process.argv[sectionIndex + 1] : 'all';
const shared = {
  schemaVersion: manifest.schemaVersion,
  kind: manifest.kind,
  sourceRevision: manifest.sourceRevision,
  productionInputTreeSha256: manifest.productionInputTreeSha256,
  generatedBy: manifest.generatedBy,
  extractionNotes: manifest.extractionNotes,
};
const sections = {
  all: manifest,
  colors: {
    ...shared,
    section: 'colors',
    appThemeTokens: manifest.sources.appThemeTokens,
    canvasThemeTokens: manifest.sources.canvasThemeTokens,
    canvasLegacyAliases: manifest.sources.canvasLegacyAliases,
    cssVariables: manifest.sources.cssVariables,
    hardcodedColors: manifest.sources.hardcodedColors,
    rawColorUtilities: manifest.sources.classes.rawColorUtilities,
    dynamicCssProperties: manifest.sources.dynamicCssProperties,
  },
  classes: {
    ...shared,
    section: 'classes',
    extraction: manifest.sources.classes.extraction,
    arbitrary: manifest.sources.classes.arbitrary,
    important: manifest.sources.classes.important,
  },
  layout: {
    ...shared,
    section: 'layout',
    extraction: manifest.sources.classes.extraction,
    spacing: manifest.sources.classes.spacing,
    size: manifest.sources.classes.size,
    responsive: manifest.sources.classes.responsive,
  },
  visual: {
    ...shared,
    section: 'visual',
    extraction: manifest.sources.classes.extraction,
    typography: manifest.sources.classes.typography,
    radius: manifest.sources.classes.radius,
    border: manifest.sources.classes.border,
    shadow: manifest.sources.classes.shadow,
    layer: manifest.sources.classes.layer,
    opacityBlur: manifest.sources.classes.opacityBlur,
    motion: manifest.sources.classes.motion,
  },
};
if (!sections[sectionName]) {
  throw new Error('Unknown --section value: ' + sectionName);
}
const output = JSON.stringify(sections[sectionName], null, 2) + '\n';
const checkIndex = process.argv.indexOf('--check');
if (checkIndex >= 0) {
  const target = process.argv[checkIndex + 1];
  if (!target) throw new Error('--check requires a manifest path');
  const current = fs.readFileSync(path.resolve(root, target), 'utf8');
  if (current !== output) {
    console.error('Design-system current style manifest is stale: ' + target);
    process.exitCode = 1;
  } else {
    console.log('Design-system current style manifest is current: ' + target);
  }
} else {
  process.stdout.write(output);
}
