#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const appDir = path.join(srcDir, 'app');
const designLabDir = path.join(srcDir, 'design-lab');
const featuresDir = path.join(srcDir, 'features');
const sharedDir = path.join(srcDir, 'shared');
const sourceExtensions = new Set(['.ts', '.tsx']);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isWithin(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function readFeatureIds() {
  if (!fs.existsSync(featuresDir)) return [];
  return fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const featureIds = readFeatureIds();
const featureIdSet = new Set(featureIds);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) return [fullPath];
    return [];
  });
}

function resolveLocalSpecifier(specifier, sourceFile) {
  if (specifier.startsWith('@/')) {
    return path.join(srcDir, specifier.slice(2));
  }

  if (specifier.startsWith('.')) {
    return path.resolve(path.dirname(sourceFile), specifier);
  }

  return null;
}

function getArea(filePath) {
  if (isWithin(filePath, appDir)) return { kind: 'app' };
  if (isWithin(filePath, designLabDir)) return { kind: 'design-lab' };
  if (isWithin(filePath, sharedDir)) return { kind: 'shared' };
  if (isWithin(filePath, featuresDir)) {
    const [featureId] = path.relative(featuresDir, filePath).split(path.sep);
    if (featureIdSet.has(featureId)) return { kind: 'feature', featureId };
  }
  return { kind: 'other' };
}

function getTargetArea(specifier, sourceFile) {
  const resolved = resolveLocalSpecifier(specifier, sourceFile);
  if (!resolved) return null;

  const area = getArea(resolved);
  if (area.kind !== 'feature') return area;

  const featureRoot = path.join(featuresDir, area.featureId);
  const relativeParts = path.relative(featureRoot, resolved).split(path.sep).filter(Boolean);
  const publicEntry =
    relativeParts.length === 0 ||
    (relativeParts.length === 1 && relativeParts[0] === 'index') ||
    (relativeParts.length === 1 && relativeParts[0] === 'index.ts');

  return {
    ...area,
    publicEntry,
    relativePath: toPosix(path.relative(featureRoot, resolved)),
  };
}

function collectModuleSpecifiers(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const specifiers = [];

  function addSpecifier(node, specifier, kind, importedNames = []) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    specifiers.push({
      kind,
      specifier,
      importedNames,
      line: position.line + 1,
      column: position.character + 1,
    });
  }

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const importedNames = ts.isImportDeclaration(node)
        ? collectImportedNames(node.importClause)
        : [];
      addSpecifier(
        node,
        node.moduleSpecifier.text,
        ts.isImportDeclaration(node) ? 'import' : 'export',
        importedNames,
      );
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      addSpecifier(node, node.arguments[0].text, 'dynamic import');
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function collectImportedNames(importClause) {
  if (!importClause) return [];
  const names = [];
  if (importClause.name) names.push(importClause.name.text);
  const namedBindings = importClause.namedBindings;
  if (!namedBindings || !ts.isNamedImports(namedBindings)) return names;
  namedBindings.elements.forEach((element) => {
    names.push((element.propertyName || element.name).text);
  });
  return names;
}

function validateFeatureShape() {
  const violations = [];

  for (const featureId of featureIds) {
    const featureRoot = path.join(featuresDir, featureId);
    for (const fileName of ['index.ts', 'manifest.ts']) {
      const expectedFile = path.join(featureRoot, fileName);
      if (!fs.existsSync(expectedFile)) {
        violations.push({
          file: toPosix(path.relative(rootDir, featureRoot)),
          line: 1,
          message: `Feature "${featureId}" must provide ${fileName}.`,
        });
      }
    }
  }

  return violations;
}

function validatePublicApiShape() {
  const violations = [];

  for (const featureId of featureIds) {
    const indexFile = path.join(featuresDir, featureId, 'index.ts');
    if (!fs.existsSync(indexFile)) continue;
    const sourceText = fs.readFileSync(indexFile, 'utf8');
    const sourceFile = ts.createSourceFile(
      indexFile,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    function visit(node) {
      if (
        ts.isExportDeclaration(node) &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      ) {
        node.exportClause.elements.forEach((element) => {
          const exportedName = element.name.text;
          if (!/^use[A-Z].*Store$/.test(exportedName)) return;
          const position = sourceFile.getLineAndCharacterOfPosition(element.getStart(sourceFile));
          violations.push({
            file: toPosix(path.relative(rootDir, indexFile)),
            line: position.line + 1,
            message: `Feature "${featureId}" public API must not export raw store hook "${exportedName}".`,
          });
        });
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return violations;
}

function validateImportBoundaries() {
  const violations = [];
  const sourceFiles = walk(srcDir);

  for (const sourceFile of sourceFiles) {
    const sourceArea = getArea(sourceFile);
    const sourceRel = toPosix(path.relative(rootDir, sourceFile));

    for (const item of collectModuleSpecifiers(sourceFile)) {
      const targetArea = getTargetArea(item.specifier, sourceFile);
      if (!targetArea) continue;

      if (sourceArea.kind === 'shared' && targetArea.kind === 'app') {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Shared code must not ${item.kind} app code: ${item.specifier}`,
        });
      }

      if (sourceArea.kind === 'shared' && targetArea.kind === 'feature') {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Shared code must not ${item.kind} feature code: ${item.specifier}`,
        });
      }

      if (sourceArea.kind !== 'design-lab' && targetArea.kind === 'design-lab') {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Production src code must not ${item.kind} Design Lab code: ${item.specifier}`,
        });
      }

      if (
        sourceArea.kind === 'design-lab' &&
        targetArea.kind === 'feature' &&
        !targetArea.publicEntry
      ) {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Design Lab must use the public API for feature "${targetArea.featureId}": ${item.specifier}`,
        });
      }

      if (sourceArea.kind === 'feature' && targetArea.kind === 'app') {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Feature "${sourceArea.featureId}" must not ${item.kind} app code: ${item.specifier}`,
        });
      }

      if (sourceArea.kind === 'app' && targetArea.kind === 'feature' && !targetArea.publicEntry) {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `App code must use the public API for feature "${targetArea.featureId}": ${item.specifier}`,
        });
      }

      if (
        sourceArea.kind === 'feature' &&
        targetArea.kind === 'feature' &&
        sourceArea.featureId !== targetArea.featureId &&
        !targetArea.publicEntry
      ) {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Feature "${sourceArea.featureId}" must use the public API for feature "${targetArea.featureId}": ${item.specifier}`,
        });
      }

      if (
        sourceArea.kind === 'feature' &&
        targetArea.kind === 'feature' &&
        sourceArea.featureId !== targetArea.featureId &&
        targetArea.publicEntry &&
        item.importedNames.some((name) => /^use[A-Z].*Store$/.test(name))
      ) {
        violations.push({
          file: sourceRel,
          line: item.line,
          message: `Feature "${sourceArea.featureId}" must depend on repository/domain APIs or narrow hooks instead of feature stores: ${item.specifier}`,
        });
      }
    }
  }

  return violations;
}

const violations = [
  ...validateFeatureShape(),
  ...validatePublicApiShape(),
  ...validateImportBoundaries(),
];

if (violations.length > 0) {
  console.error(`Feature boundary check failed with ${violations.length} violation(s):`);
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.message}`);
  }
  process.exitCode = 1;
} else {
  console.log('Feature boundary check passed.');
}
