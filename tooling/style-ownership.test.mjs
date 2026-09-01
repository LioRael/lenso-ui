import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const allowedGlobalStylesheets = [
  "apps/docs/app/reset.css",
  "apps/docs/app/styles.css",
  "packages/tokens/src/styles.css",
  "packages/ui/src/preflight.css",
];
async function findCssModules(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const modules = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.name !== "node_modules" &&
          entry.name !== ".next" &&
          entry.name !== "dist" &&
          entry.name !== "out",
      )
      .map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findCssModules(entryPath);
        return entry.name.endsWith(".module.css") ? [entryPath] : [];
      }),
  );
  return modules.flat();
}

async function findSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.name !== "node_modules" &&
          entry.name !== ".next" &&
          entry.name !== "dist" &&
          entry.name !== "out",
      )
      .map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findSourceFiles(entryPath);
        return /\.(?:mdx?|tsx?)$/.test(entry.name) ? [entryPath] : [];
      }),
  );
  return files.flat();
}

async function findCssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.name !== "node_modules" &&
          entry.name !== ".next" &&
          entry.name !== "dist" &&
          entry.name !== "out",
      )
      .map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findCssFiles(entryPath);
        return entry.name.endsWith(".css") ? [entryPath] : [];
      }),
  );
  return files.flat();
}

test("new component styles are owned by StyleX modules", async () => {
  const cssModules = (await findCssModules(repositoryRoot)).map((file) =>
    path.relative(repositoryRoot, file),
  );
  assert.deepEqual(
    cssModules,
    [],
    `CSS Modules are not allowed. Colocate component styles in a .stylex.ts file:\n${cssModules.join("\n")}`,
  );
});

test("plain CSS is limited to reset, preflight, and generated tokens", async () => {
  const cssFiles = (await findCssFiles(repositoryRoot))
    .map((file) => path.relative(repositoryRoot, file))
    .sort();

  assert.deepEqual(cssFiles, allowedGlobalStylesheets.toSorted());
});

test("the docs global stylesheet only owns the document root", async () => {
  const globalStyles = await readFile(
    path.join(repositoryRoot, "apps/docs/app/styles.css"),
    "utf8",
  );
  const normalizedStyles = globalStyles.trim();

  assert.match(normalizedStyles, /^@import "\.\/reset\.css";\n\n@stylex;/);
  assert.doesNotMatch(
    normalizedStyles,
    /(^|\n)\s*(?:\.|#|\[)/,
    "apps/docs/app/styles.css may only style html and body. Move component styles to StyleX.",
  );
  assert.ok(normalizedStyles.split("\n").length <= 16);
});

test("StyleX is the only public component style override", async () => {
  const uiSource = await readFile(
    path.join(repositoryRoot, "packages/ui/src/shared/stylex-props.ts"),
    "utf8",
  );
  const registryBuilder = await readFile(
    path.join(repositoryRoot, "tooling/registry-builder/src/cli.ts"),
    "utf8",
  );

  assert.match(uiSource, /xstyle\?: stylex\.StyleXStyles/);
  assert.doesNotMatch(registryBuilder, /merge-class-name/);

  const sourceRoots = [
    "apps/docs",
    "packages/primitives/src",
    "packages/ui/src",
    "registry/source",
  ];
  const sourceFiles = (
    await Promise.all(sourceRoots.map((root) => findSourceFiles(path.join(repositoryRoot, root))))
  ).flat();
  const violations = [];

  for (const file of sourceFiles) {
    const source = await readFile(file, "utf8");
    if (/mergeClassName|merge-class-name|\.filter\(Boolean\)\.join\(["'] ["']\)/.test(source)) {
      violations.push(path.relative(repositoryRoot, file));
    }
  }

  assert.deepEqual(
    violations,
    [],
    `String class-name composition is not allowed; expose xstyle instead:\n${violations.join("\n")}`,
  );
});
