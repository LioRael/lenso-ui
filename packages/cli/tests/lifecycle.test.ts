import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
  symlink,
  link,
  unlink,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { fixture } from "./fixture.ts";
import { planDependencies, doctorProject, nodeCompatibility } from "../src/lifecycle.ts";
import { applyPlan, planFiles, parsePackage } from "../src/project.ts";

async function consumer(pkg: Record<string, unknown> = {}) {
  const directory = await mkdtemp(join(tmpdir(), "lenso-lifecycle-"));
  await writeFile(join(directory, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  return directory;
}

test("dependency plans are zero-write dry runs and install conflicts block apply", async () => {
  const directory = await consumer({ dependencies: { "@lenso/ui": "0.8.0", react: "19.2.0" } });
  try {
    const before = await readFile(join(directory, "package.json"), "utf8");
    for (const action of ["install", "upgrade", "uninstall"] as const) {
      const plan = await planDependencies(directory, action, await fixture());
      assert.equal(plan.dryRun, true);
      assert.equal(await readFile(join(directory, "package.json"), "utf8"), before);
      assert.deepEqual(await readdir(directory), ["package.json"]);
      if (action === "install") {
        assert.ok(plan.conflicts.length);
        assert.equal((await applyPlan(plan)).applied, false);
      }
    }
    assert.equal(await readFile(join(directory, "package.json"), "utf8"), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("upgrade pins only existing managed entries and preserves unrelated data and config", async () => {
  const directory = await consumer({
    dependencies: { "@lenso/ui": "0.8.0", react: "^19.2.0", "@stylexjs/stylex": "0.18.0" },
    devDependencies: { "@lenso/tokens": "0.8.0", "@lenso/stylex-build": "0.0.1", vite: "8.3.2" },
    scripts: { build: "custom build", test: "custom test" },
    custom: { untouched: true },
  });
  try {
    const config = "// authored setup\nexport default {};\n";
    await writeFile(join(directory, "vite.config.ts"), config);
    const plan = await planDependencies(directory, "upgrade", await fixture());
    assert.deepEqual(
      plan.changes.map(({ file }) => file),
      ["package.json"],
    );
    assert.equal((await applyPlan(plan)).applied, true);
    const pkg = parsePackage(await readFile(join(directory, "package.json"), "utf8"));
    assert.deepEqual(pkg.dependencies, {
      "@lenso/ui": "0.9.0",
      react: "^19.2.0",
      "@stylexjs/stylex": "0.19.1",
    });
    assert.deepEqual(pkg.devDependencies, {
      "@lenso/tokens": "0.9.0",
      "@lenso/stylex-build": "0.1.0",
      vite: "8.3.2",
    });
    assert.deepEqual(pkg.scripts, { build: "custom build", test: "custom test" });
    assert.deepEqual(pkg["custom"], { untouched: true });
    assert.equal(await readFile(join(directory, "vite.config.ts"), "utf8"), config);
    const missing = await consumer({ dependencies: { react: "19.2.0" } });
    try {
      assert.deepEqual((await planDependencies(missing, "upgrade", await fixture())).changes, []);
    } finally {
      await rm(missing, { recursive: true, force: true });
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("install plans exactly the integration dependencies; uninstall leaves runtime and authored files", async () => {
  const directory = await consumer({
    dependencies: { react: "19.2.0" },
    scripts: { build: "vite build" },
  });
  try {
    const contract = await fixture();
    const installed = await planDependencies(directory, "install", contract);
    assert.equal((await applyPlan(installed)).applied, true);
    let pkg = parsePackage(await readFile(join(directory, "package.json"), "utf8"));
    assert.deepEqual(pkg.dependencies, {
      react: "19.2.0",
      "@lenso/ui": "0.9.0",
      "@lenso/tokens": "0.9.0",
      "@stylexjs/stylex": "0.19.1",
    });
    assert.deepEqual(pkg.devDependencies, { "@lenso/stylex-build": "0.1.0" });
    const authored = {
      "lenso.theme.css": '@import "@lenso/tokens/styles.css";\n',
      "app.tsx": 'import { Button } from "@lenso/ui";\n',
      "lenso.stylex.mjs": "// preserved config\n",
    };
    for (const [file, contents] of Object.entries(authored))
      await writeFile(join(directory, file), contents);
    const plan = await planDependencies(directory, "uninstall", contract);
    assert.deepEqual(
      plan.changes.map(({ file }) => file),
      ["package.json"],
    );
    assert.ok(plan.manual.some((message) => /CSS.*imports.*manually/.test(message)));
    await applyPlan(plan);
    pkg = parsePackage(await readFile(join(directory, "package.json"), "utf8"));
    assert.deepEqual(pkg.dependencies, { react: "19.2.0", "@stylexjs/stylex": "0.19.1" });
    assert.deepEqual(pkg.scripts, { build: "vite build" });
    for (const [file, contents] of Object.entries(authored))
      assert.equal(await readFile(join(directory, file), "utf8"), contents);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("stale plans, symlink manifests and hardlinked manifests never overwrite data", async () => {
  const directory = await consumer();
  try {
    const contract = await fixture();
    const plan = await planDependencies(directory, "install", contract);
    const changed = '{"user":"changed"}\n';
    await writeFile(join(directory, "package.json"), changed);
    await assert.rejects(applyPlan(plan), /changed after planning/);
    assert.equal(await readFile(join(directory, "package.json"), "utf8"), changed);
    await unlink(join(directory, "package.json"));
    await writeFile(join(directory, "target.json"), changed);
    await symlink("target.json", join(directory, "package.json"));
    await assert.rejects(planDependencies(directory, "install", contract), /Unsafe project file/);
    await assert.rejects(applyPlan(plan), /Unsafe project file/);
    await unlink(join(directory, "package.json"));
    await link(join(directory, "target.json"), join(directory, "package.json"));
    await assert.rejects(planDependencies(directory, "install", contract), /single regular file/);
    assert.equal(await readFile(join(directory, "target.json"), "utf8"), changed);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("general file plans preserve ownership and reject stale preimages or unsafe parent directories", async () => {
  const directory = await consumer();
  try {
    const contract = await fixture();
    const before = "# Authored guidance\n";
    await writeFile(join(directory, "AGENTS.md"), before);
    const proposed = before + "\nGenerated marker section\n";
    assert.ok(
      (await planFiles(directory, contract, { files: { "AGENTS.md": proposed } })).conflicts.length,
    );
    const merge = await planFiles(directory, contract, {
      files: { "AGENTS.md": proposed, ".agents/docs/setup.md": "# Setup\n" },
      expected: { "AGENTS.md": before },
    });
    assert.equal(await readFile(join(directory, "AGENTS.md"), "utf8"), before);
    await applyPlan(merge);
    assert.equal(await readFile(join(directory, "AGENTS.md"), "utf8"), proposed);
    assert.equal(await readFile(join(directory, ".agents/docs/setup.md"), "utf8"), "# Setup\n");
    assert.equal(
      (
        await planFiles(directory, contract, {
          files: { ".agents/docs/setup.md": "# Updated setup\n" },
        })
      ).conflicts.length,
      0,
    );
    const stale = await planFiles(directory, contract, {
      files: { ".agents/docs/setup.md": "# Updated setup\n" },
    });
    await writeFile(join(directory, ".agents/docs/setup.md"), "# User edit\n");
    await assert.rejects(applyPlan(stale), /changed after planning/);
    await mkdir(join(directory, "real"));
    await symlink("real", join(directory, "alias"));
    await assert.rejects(
      planFiles(directory, contract, { files: { "alias/new.md": "# Nope\n" } }),
      /Unsafe project directory/,
    );
    await assert.rejects(
      planFiles(directory, contract, { files: { "../escape.md": "# Nope\n" } }),
      /Unsafe project path/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("doctor reports static/skipped, environment and actual resolution without repair or executing entries", async () => {
  const directory = await consumer();
  try {
    const contract = await fixture();
    await applyPlan(await planDependencies(directory, "install", contract));
    await writeFile(join(directory, "app.ts"), "const unresolved = import(variable);\n");
    const before = await readFile(join(directory, "package.json"), "utf8");
    const missing = await doctorProject(directory, contract);
    assert.equal(missing.automaticRepair, false);
    assert.ok(missing.skipped.some(({ ruleId }) => ruleId === "lenso/runtime-import"));
    assert.ok(missing.evidence.some(({ kind }) => kind === "static"));
    assert.ok(missing.evidence.some(({ kind }) => kind === "environment"));
    assert.ok(missing.diagnostics.some(({ ruleId }) => ruleId === "lenso/package-resolution"));
    for (const [name, version] of Object.entries({
      "@lenso/ui": "0.8.0",
      "@lenso/tokens": "0.9.0",
      "@stylexjs/stylex": "0.19.1",
      "@lenso/stylex-build": "0.1.0",
    })) {
      const folder = join(directory, "node_modules", name);
      await mkdir(folder, { recursive: true });
      const exports =
        name === "@lenso/tokens"
          ? {
              ".": { types: "./index.d.ts", import: "./index.js" },
              "./styles.css": "./styles.css",
              "./stylex-rules.json": "./stylex-rules.json",
            }
          : { ".": { import: "./index.js" }, "./package.json": "./package.json" };
      await writeFile(
        join(folder, "package.json"),
        JSON.stringify({ name, version, type: "module", exports }),
      );
      await writeFile(
        join(folder, "index.js"),
        "throw new Error('package code must never run');\n",
      );
      if (name === "@lenso/tokens") {
        await writeFile(join(folder, "styles.css"), ":root {}\n");
        await writeFile(join(folder, "stylex-rules.json"), "{}\n");
      }
    }
    const resolved = await doctorProject(directory, contract);
    assert.ok(resolved.diagnostics.some(({ ruleId }) => ruleId === "lenso/resolved-version"));
    assert.ok(
      resolved.evidence.some(
        ({ subject, status }) => subject === "@lenso/tokens" && status === "pass",
      ),
    );
    await unlink(join(directory, "node_modules/@lenso/tokens/styles.css"));
    const assetMissing = await doctorProject(directory, contract);
    assert.ok(
      assetMissing.evidence.some(
        ({ subject, status }) => subject === "@lenso/tokens" && status === "error",
      ),
    );
    await writeFile(join(directory, "node_modules/@lenso/tokens/styles.css"), ":root {}\n");
    await unlink(join(directory, "node_modules/@lenso/ui/index.js"));
    const entryMissing = await doctorProject(directory, contract);
    assert.ok(
      entryMissing.diagnostics.some(
        ({ ruleId, message }) =>
          ruleId === "lenso/package-resolution" && message.includes("@lenso/ui"),
      ),
    );
    assert.equal(await readFile(join(directory, "package.json"), "utf8"), before);
    assert.equal(nodeCompatibility("v26.10.0", "^26.10.0"), true);
    assert.equal(nodeCompatibility("v26.9.0", "^26.10.0"), false);
    assert.equal(nodeCompatibility("v27.0.0", "^26.10.0"), false);
    assert.equal(nodeCompatibility("v26.10.0", ">=26"), null);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
