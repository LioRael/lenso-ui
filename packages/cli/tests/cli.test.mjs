import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, readdir, symlink, link, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../src/cli.mjs";
import { createQueries } from "../src/contract.mjs";
import { planInit, applyInit, checkProject } from "../src/project.mjs";
import { fixture, authoredMarkdown } from "./fixture.mjs";
import { parseSource } from "../../../scripts/source-imports.mjs";

async function project(framework) {
  const root = await mkdtemp(join(tmpdir(), "lenso-devtools-"));
  const packageJson = {
    name: "real-starter",
    private: true,
    type: "module",
    custom: { preserve: true },
    scripts:
      framework === "next"
        ? { dev: "next dev", build: "next build", start: "next start" }
        : { dev: "vite", build: "vite build" },
    dependencies: {
      react: "19.2.4",
      "react-dom": "19.2.4",
      ...(framework === "next" ? { next: "16.3.8" } : {}),
    },
    devDependencies: framework === "vite" ? { vite: "8.3.2", "@vitejs/plugin-react": "6.0.1" } : {},
  };
  await writeFile(join(root, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
  return root;
}

test("caller commands resolve actual API rows and preserve exact authored Markdown", async () => {
  const contract = await fixture();
  const queries = createQueries(contract);
  assert.equal(queries.list().length, 1);
  const api = queries.api("Menu");
  for (const part of api.parts)
    for (const property of part.properties)
      assert.deepEqual(property, { id: property.id, ...contract.api.properties[property.id] });
  assert.equal(
    (await run(["docs", "Menu", "--locale", "cn"], contract)).output,
    authoredMarkdown("cn"),
  );
  assert.equal(queries.examples("Menu")[0].name, "dropdown-basic");
  assert.deepEqual(queries.examples("menu", "cn"), []);
  for (const name of ["Dropdown", "dropdown", "../menu", "https://example.org"])
    assert.throws(() => queries.api(name), /Unknown component/);
  assert.throws(() => queries.documentation("menu", "fr"), /locale/);
  assert.throws(() => createQueries({ ...contract, lensoVersion: "99" }));
  assert.throws(() => createQueries({ ...contract, formatVersion: 1 }), /require format 2/);
  await assert.rejects(run(["init", "--framework", "vite", "--execute"], contract), /Unknown/);
});

for (const framework of ["vite", "next"]) {
  test(`${framework} starter: dry run changes zero bytes; explicit write preserves metadata and is idempotent`, async () => {
    const root = await project(framework);
    const contract = await fixture();
    const before = await readFile(join(root, "package.json"), "utf8");
    const result = await run(["init", "--framework", framework, "--json"], contract, root);
    const plan = JSON.parse(result.output);
    assert.deepEqual(plan.conflicts, []);
    assert.deepEqual(await readdir(root), ["package.json"]);
    assert.equal(await readFile(join(root, "package.json"), "utf8"), before);
    assert.equal((await applyInit(plan)).applied, true);
    const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    assert.deepEqual(pkg.custom, { preserve: true });
    assert.equal(pkg.dependencies["@lenso/ui"], contract.lensoVersion);
    assert.equal(pkg.devDependencies["@lenso/stylex-build"], "0.1.0");
    assert.match(await readFile(join(root, "lenso.stylex.mjs"), "utf8"), /stylex-rules\.json/);
    assert.match(await readFile(join(root, "lenso.theme.css"), "utf8"), /styles\.css/);
    assert.deepEqual((await planInit(root, framework, contract)).changes, []);
  });
}

test("dirty generated config and arbitrary existing starter configs are never overwritten", async () => {
  const contract = await fixture();
  const root = await project("vite");
  await writeFile(
    join(root, "vite.config.ts"),
    `import { defineConfig } from "vite";\nexport default defineConfig({ server: { port: 1234 } });\n`,
  );
  const before = await readFile(join(root, "package.json"), "utf8");
  const plan = await planInit(root, "vite", contract);
  assert.match(plan.conflicts.join("\n"), /user-owned/);
  assert.equal((await applyInit(plan)).applied, false);
  assert.equal(await readFile(join(root, "package.json"), "utf8"), before);
  const clean = await project("vite");
  await applyInit(await planInit(clean, "vite", contract));
  await writeFile(join(clean, "vite.config.mjs"), "export default { custom: true };\n");
  const dirty = await planInit(clean, "vite", contract);
  assert.match(dirty.conflicts.join("\n"), /Refusing overwrite/);
  assert.equal((await applyInit(dirty)).applied, false);
});

test("changed-after-plan, symlink and hardlink package paths refuse write before mutation", async () => {
  const contract = await fixture();
  const root = await project("vite");
  const plan = await planInit(root, "vite", contract);
  await writeFile(join(root, "package.json"), '{"changed":true}');
  await assert.rejects(applyInit(plan), /changed after planning/);
  assert.deepEqual(await readdir(root), ["package.json"]);
  const unsafe = await project("vite");
  const outside = await project("vite");
  await symlink(join(outside, "package.json"), join(unsafe, "vite.config.mjs"));
  await assert.rejects(planInit(unsafe, "vite", contract), /Unsafe project file/);
  const alias = `${unsafe}-alias`;
  await symlink(unsafe, alias);
  await assert.rejects(planInit(alias, "vite", contract), /symlink/);
  const hard = await project("vite");
  await link(join(hard, "package.json"), join(hard, "copy.json"));
  await assert.rejects(planInit(hard, "vite", contract), /single regular file/);
});

test("consumer check uses shared policy without library-only React Aria restrictions or writes", async () => {
  const root = await project("vite");
  const contract = await fixture();
  await writeFile(
    join(root, "consumer.tsx"),
    `import { Button } from "react-aria-components";\nimport tw from "tailwindcss";\n`,
  );
  const files = await readdir(root);
  const result = await checkProject(root, contract);
  assert.ok(result.diagnostics.some((entry) => entry.ruleId === "lenso/no-tailwind-runtime"));
  assert.ok(!result.diagnostics.some((entry) => entry.ruleId === "lenso/react-aria-family"));
  assert.deepEqual(await readdir(root), files);
  await applyInit(await planInit(root, "vite", contract));
  await writeFile(join(root, "main.tsx"), 'import "./lenso.theme.css";\n');
  assert.ok(
    !(await checkProject(root, contract)).diagnostics.some(
      (entry) => entry.ruleId === "lenso/theme-css",
    ),
  );
  const next = await project("next");
  await mkdir(join(next, "app"));
  await writeFile(
    join(next, "app/global-error.tsx"),
    "export default function Error() { return null; }",
  );
  assert.match((await planInit(next, "next", contract)).conflicts.join("\n"), /global-error/);
  await mkdir(join(next, "pages"));
  await writeFile(join(next, "pages/index.tsx"), "export default function Page() { return null; }");
  assert.match((await planInit(next, "next", contract)).conflicts.join("\n"), /Pages Router/);
  assert.ok(
    (await checkProject(next, contract)).diagnostics.some(
      (entry) => entry.ruleId === "lenso/next-router",
    ),
  );
});

test("typed Vite and Next starter configs remain user-owned and plans contain valid helper modules", async () => {
  const contract = await fixture();
  for (const framework of ["vite", "next"]) {
    const root = await project(framework);
    const source =
      framework === "vite"
        ? 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()] });\n'
        : 'import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n';
    parseSource(source, `${framework}.config.ts`);
    await writeFile(join(root, `${framework}.config.ts`), source);
    const beforePackage = await readFile(join(root, "package.json"), "utf8");
    const plan = await planInit(root, framework, contract);
    assert.match(plan.conflicts.join("\n"), /user-owned/);
    for (const change of plan.changes.filter((entry) => entry.file.endsWith(".mjs")))
      assert.doesNotThrow(() => parseSource(change.after, change.file));
    assert.equal((await applyInit(plan)).applied, false);
    assert.equal(await readFile(join(root, `${framework}.config.ts`), "utf8"), source);
    assert.equal(await readFile(join(root, "package.json"), "utf8"), beforePackage);
  }
});

test("unknown build support and ownership formats fail closed before any write", async () => {
  const root = await project("vite");
  const contract = await fixture();
  await writeFile(join(root, ".lenso-init.json"), '{"userMetadata":true}');
  await assert.rejects(planInit(root, "vite", contract), /Unknown.*ownership/);
  const unknown = structuredClone(contract);
  unknown.compatibility.schemaVersion = 2;
  const { contractDigest } = await import("../../../tooling/lenso-contracts/index.mjs");
  unknown.digest = contractDigest(unknown);
  await assert.rejects(planInit(root, "vite", unknown), /buildSupport/);
  assert.deepEqual((await readdir(root)).sort(), [".lenso-init.json", "package.json"]);
});
