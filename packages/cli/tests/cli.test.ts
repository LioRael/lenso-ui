import assert from "node:assert/strict";
import { afterEach, test } from "bun:test";
import { mkdtemp, writeFile, readFile, readdir, symlink, link, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { run } from "../src/cli.ts";
import { createQueries } from "@lenso/ui-devtools/queries";
import { planInit, applyInit, checkProject } from "../src/project.ts";
import { fixture, authoredMarkdown } from "@lenso/ui-devtools/testing";
import { parseSource } from "@lenso/ui-devtools/parser";

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function project(framework: "vite" | "next") {
  const root = await mkdtemp(join(tmpdir(), "lenso-devtools-"));
  temporaryDirectories.push(root);
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
  assert.equal(queries.examples("Menu")[0]?.name, "dropdown-basic");
  assert.deepEqual(queries.examples("menu", "cn"), []);
  for (const name of ["Dropdown", "dropdown", "../menu", "https://example.org"])
    assert.throws(() => queries.api(name), /Unknown component/);
  assert.throws(() => queries.documentation("menu", "fr"), /locale/);
  assert.throws(() => createQueries({ ...contract, lensoVersion: "99" }));
  assert.throws(() => createQueries({ ...contract, formatVersion: 1 }), /require format 3/);
  await assert.rejects(run(["init", "--framework", "vite", "--execute"], contract), /Unknown/);
});

for (const framework of ["vite", "next"] as const) {
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
    const configFile = `${framework}.config.ts`;
    const config = await readFile(join(root, configFile), "utf8");
    if (framework === "vite") {
      assert.equal(pkg.devDependencies["@stylexjs/unplugin"], "0.19.1");
      assert.match(config, /@stylexjs\/unplugin/);
      assert.match(config, /stylex\.vite/);
    } else {
      assert.equal(pkg.devDependencies["@stylexjs/babel-plugin"], "0.19.1");
      assert.equal(pkg.devDependencies["@stylexjs/postcss-plugin"], "0.19.1");
      assert.match(config, /transpilePackages/);
    }
    assert.doesNotThrow(() => parseSource(config, configFile));
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
  await writeFile(join(clean, "vite.config.ts"), "export default { custom: true };\n");
  const dirty = await planInit(clean, "vite", contract);
  assert.match(dirty.conflicts.join("\n"), /Refusing overwrite/);
  assert.equal((await applyInit(dirty)).applied, false);
});

test("legacy generated JavaScript configs are reported without changing consumer files", async () => {
  const contract = await fixture();
  const root = await project("vite");
  const files = {
    "vite.config.mjs": 'import "./lenso.stylex.mjs";\nexport default {};\n',
    "lenso.stylex.mjs": "export const lensoStylex = {};\n",
    "lenso.theme.css": '@import "@lenso/tokens/styles.css";\n',
  };
  for (const [name, content] of Object.entries(files)) await writeFile(join(root, name), content);
  const state = JSON.stringify({
    formatVersion: 1,
    digest: contract.digest,
    files: Object.fromEntries(
      Object.entries(files).map(([name, content]) => [
        name,
        createHash("sha256").update(content).digest("hex"),
      ]),
    ),
  });
  await writeFile(join(root, ".lenso-init.json"), state);
  const plan = await planInit(root, "vite", contract);
  assert.match(plan.conflicts.join("\n"), /Existing vite\.config\.mjs is user-owned/);
  assert.equal((await applyInit(plan)).applied, false);
  for (const [name, content] of Object.entries(files))
    assert.equal(await readFile(join(root, name), "utf8"), content);
  assert.equal(await readFile(join(root, ".lenso-init.json"), "utf8"), state);
});

// Main config ownership checks do not catch a second Babel/PostCSS config in another format.
test("Next init preserves alternative Babel and PostCSS configurations", async () => {
  for (const filename of ["babel.config.cjs", "postcss.config.mjs"]) {
    const root = await project("next");
    await writeFile(join(root, filename), "export default {};\n");
    const plan = await planInit(root, "next", await fixture());
    assert.ok(plan.conflicts.some((conflict) => conflict.includes(filename)));
    assert.equal((await applyInit(plan)).applied, false);
    assert.deepEqual((await readdir(root)).sort(), [filename, "package.json"].sort());
  }
});

test("generated Next configuration uses official Babel/PostCSS and includes source packages", async () => {
  const root = await project("next");
  try {
    const plan = await planInit(root, "next", await fixture());
    assert.deepEqual(plan.conflicts, []);
    await applyInit(plan);
    const generated = (await import(join(root, "next.config.ts"))).default;
    assert.deepEqual(generated.transpilePackages, ["@lenso/tokens"]);
    assert.match(
      await readFile(join(root, "babel.config.json"), "utf8"),
      /@stylexjs\/babel-plugin/,
    );
    assert.match(
      await readFile(join(root, "postcss.config.cjs"), "utf8"),
      /@stylexjs\/postcss-plugin/,
    );
    assert.match(await readFile(join(root, "lenso.theme.css"), "utf8"), /@stylex;/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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
  await symlink(join(outside, "package.json"), join(unsafe, "vite.config.ts"));
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
  assert.ok(
    (await checkProject(next, contract)).diagnostics.some(
      (entry) => entry.ruleId === "lenso/next-global-error",
    ),
  );
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
  for (const framework of ["vite", "next"] as const) {
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
    for (const change of plan.changes.filter((entry) => entry.file.endsWith(".ts")))
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
  const unknown = {
    ...structuredClone(contract),
    compatibility: { ...contract.compatibility, schemaVersion: 99 },
  };
  const { contractDigest } = await import("@lenso/ui-devtools/contract");
  unknown.digest = contractDigest(unknown);
  await assert.rejects(planInit(root, "vite", unknown), /schemaVersion/);
  assert.deepEqual((await readdir(root)).sort(), [".lenso-init.json", "package.json"]);
});

test("query data stays bound to its digest after caller or returned-reference mutations", async () => {
  const contract = await fixture();
  const queries = createQueries(contract);
  const original = queries.theme().declarations[0];
  assert.ok(original);
  const value = original.value;
  contract.theme.declarations[0]!.value = "Caller mutation";
  assert.equal(queries.theme().declarations[0]?.value, value);
  assert.equal(queries.metadata().digest, contract.digest);
  assert.throws(() => {
    original.value = "Returned mutation";
  }, TypeError);
  assert.throws(() => {
    queries.metadata().packageVersions["@lenso/ui"] = "9.9.9";
  }, TypeError);
});

test("CLI deep-query commands share release identity and reject unknown arguments", async () => {
  const contract = await fixture();
  const queries = createQueries(contract);
  for (const [argv, expected] of [
    [["source", "Menu", "--json"], queries.source("Menu")],
    [["styles", "Menu", "--json"], queries.styles("Menu")],
    [["examples", "Menu", "--locale", "en", "--json"], queries.examples("Menu", "en")],
    [["theme", "--json"], queries.theme()],
    [
      ["search", "Menu", "--locale", "en", "--limit", "1", "--json"],
      queries.search("Menu", "en", 1),
    ],
  ] as const) {
    const response = await run(argv, contract);
    assert.equal(response.exitCode, 0);
    assert.deepEqual(JSON.parse(response.output), { metadata: queries.metadata(), data: expected });
  }
  await assert.rejects(run(["source", "../../secrets", "--json"], contract), /Unknown component/);
  await assert.rejects(run(["search", "Menu", "--limit", "0"], contract), /integer/);
  await assert.rejects(run(["theme", "--write"], contract), /Unknown/);
  await assert.rejects(run(["skills", "--global"], contract), /Unknown/);
});
