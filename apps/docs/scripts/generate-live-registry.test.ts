import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  discoverLiveExamples,
  findDemoExport,
  generateLiveRegistry,
} from "./generate-live-registry.ts";

// Runtime names and ARIA labels must not expose retired source-family names.
test("registers canonical Menu scenario names without rewriting private source references", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-canonical-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "src/demos/en/menu"), { recursive: true });
  await mkdir(path.join(directory, "content"), { recursive: true });
  const source = {
    examples: {
      en: {
        "dropdown-default": {
          source: "apps/docs/src/demos/en/dropdown/default.tsx",
          file: "content/examples/en/dropdown/default.json",
        },
      },
      cn: {},
    },
  };
  const original = JSON.stringify(source);
  await writeFile(path.join(directory, "content/source-index.json"), original);
  await writeFile(
    path.join(directory, "src/demos/en/menu/default.tsx"),
    "export function Default() { return null; }",
  );
  const manifest = await generateLiveRegistry(directory);
  assert.deepEqual(manifest.en, { "menu-default": "en/menu/default.tsx" });
  const generated = await readFile(path.join(directory, "src/demos/generated.ts"), "utf8");
  assert.match(generated, /"menu-default":/);
  assert.ok(!generated.includes("dropdown-default"));
  assert.equal(await readFile(path.join(directory, "content/source-index.json"), "utf8"), original);
  await writeFile(path.join(directory, "src/demos/generated.ts"), "// existing tooling registry");
  assert.deepEqual(
    await generateLiveRegistry(directory, { cn: {} }, { globalRegistry: false }),
    manifest,
  );
  assert.equal(
    await readFile(path.join(directory, "src/demos/generated.ts"), "utf8"),
    "// existing tooling registry",
  );
  assert.deepEqual(
    JSON.parse(await readFile(path.join(directory, "src/demos/live-manifest.json"), "utf8")),
    manifest,
  );
});

// Imported-content integrity does not prove that added local scenarios reach the runtime registry.
test("discovers exact source paths, loads aliases once and does not register absent or unrelated demos", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-live-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "src/demos/en/field"), { recursive: true });
  await mkdir(path.join(directory, "content"), { recursive: true });
  const entry = { source: "apps/docs/src/demos/en/field/controlled.tsx" };
  const source = {
    examples: {
      en: {
        "field-controlled": entry,
        "field-legacy": { ...entry, aliasOf: "field-controlled" },
        "field-absent": { source: "apps/docs/src/demos/en/field/absent.tsx" },
      },
    },
  };
  await writeFile(path.join(directory, "content/source-index.json"), JSON.stringify(source));
  await writeFile(
    path.join(directory, "src/demos/en/field/controlled.tsx"),
    "export function Controlled() { return null; }\n",
  );
  await writeFile(
    path.join(directory, "src/demos/en/field/unregistered.tsx"),
    "export function Unregistered() { return null; }\n",
  );
  assert.deepEqual(await generateLiveRegistry(directory), {
    en: {
      "field-controlled": "en/field/controlled.tsx",
      "field-legacy": "en/field/controlled.tsx",
    },
    cn: {},
  });
  const generated = await readFile(path.join(directory, "src/demos/generated.ts"), "utf8");
  assert.equal(generated.match(/import\("\.\/en\/field\/controlled"\)/g)?.length, 1);
  assert.match(generated, /module\.Controlled/);
  assert.match(generated, /"field-legacy": Demo0/);
});

test("rejects unsafe source paths and modules without a callable export rather than certifying them live", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-live-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await assert.rejects(
    discoverLiveExamples(directory, {
      examples: { en: { unsafe: { source: "apps/docs/src/demos/en/../../private.tsx" } } },
    }),
    /Unsafe live demo path/,
  );
  await mkdir(path.join(directory, "src/demos/en/field"), { recursive: true });
  await writeFile(
    path.join(directory, "src/demos/en/field/basic.tsx"),
    "export type Props = {};\n",
  );
  await assert.rejects(
    discoverLiveExamples(directory, {
      examples: { en: { invalid: { source: "apps/docs/src/demos/en/field/basic.tsx" } } },
    }),
    /No exported live demo/,
  );
});

test("resolves genuine named re-exports, default demos and memoized scenarios without choosing exported style data", () => {
  assert.equal(
    findDemoExport(
      "export { Controlled as ControlledSelection } from './source';",
      "controlled.tsx",
      "ControlledSelection",
    ),
    "ControlledSelection",
  );
  assert.equal(
    findDemoExport("export default function Basic() { return null; }", "basic.tsx", "Basic"),
    "default",
  );
  assert.equal(
    findDemoExport("const Demo = () => null; export default Demo;", "basic.tsx", "Demo"),
    "default",
  );
  assert.throws(() => findDemoExport("export default {};", "styles.tsx"), /No exported live demo/);
  assert.throws(
    () => findDemoExport("const styles = {}; export { styles };", "styles.tsx"),
    /No exported live demo/,
  );
  for (const code of [
    "declare function Ambient(): null; export { Ambient };",
    "function Bodyless(): null; export { Bodyless };",
    "export declare function Ambient(): null;",
    "export function Bodyless(): null;",
  ])
    assert.throws(() => findDemoExport(code, "ambient.tsx"), /No exported live demo/, code);
  assert.equal(
    findDemoExport(
      "function Demo() { return null; } export { Demo as Scenario };",
      "demo.tsx",
      "Scenario",
    ),
    "Scenario",
  );
  assert.equal(
    findDemoExport(
      "export const styles = {}; export const Demo = React.memo(() => null);",
      "demo.tsx",
      "Demo",
    ),
    "Demo",
  );
});

test("registers maintained Chinese modules and deduplicates aliases and explicit equivalent reuse", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-localized-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "content"), { recursive: true });
  await mkdir(path.join(directory, "src/demos/en/field"), { recursive: true });
  await mkdir(path.join(directory, "src/demos/cn/field"), { recursive: true });
  const source = {
    examples: {
      en: Object.fromEntries(
        ["basic", "alias", "reuse", "missing"].map((name) => [
          name,
          {
            source: `apps/docs/src/demos/en/field/${name === "alias" ? "basic" : name}.tsx`,
          },
        ]),
      ),
    },
  };
  await writeFile(path.join(directory, "content/source-index.json"), JSON.stringify(source));
  for (const file of [
    "en/field/basic",
    "en/field/reuse",
    "en/field/missing",
    "cn/field/basic",
    "cn/field/reuse",
  ])
    await writeFile(
      path.join(directory, `src/demos/${file}.tsx`),
      "export default function Demo() { return null; }\n",
    );
  const localized = {
    cn: {
      basic: "cn/field/basic.tsx",
      alias: "cn/field/basic.tsx",
      reuse: "en/field/reuse.tsx",
    },
  };
  assert.deepEqual(
    (await generateLiveRegistry(directory, { cn: { reuse: "en/field/reuse.tsx" } })).cn,
    localized.cn,
    "Existing CN counterparts register automatically; explicit English reuse overrides discovery",
  );
  const manifest = await generateLiveRegistry(directory, localized);
  assert.equal(manifest.cn.missing, undefined);
  assert.deepEqual(manifest.cn, localized.cn);
  const edited =
    'export default function Demo() { return <button aria-label="读取">读取</button>; }\n\n';
  const maintainedFile = path.join(directory, "src/demos/cn/field/basic.tsx");
  await writeFile(maintainedFile, edited);
  assert.deepEqual(await generateLiveRegistry(directory, localized), manifest);
  assert.equal(await readFile(maintainedFile, "utf8"), edited);
  const generated = await readFile(path.join(directory, "src/demos/generated.ts"), "utf8");
  assert.equal(generated.match(/import\("\.\/cn\/field\/basic"\)/g)?.length, 1);
  assert.equal(generated.match(/import\("\.\/en\/field\/reuse"\)/g)?.length, 1);
  assert.match(generated, /module\.default/);
  assert.match(generated, /cn: \{\n\s*basic: Demo3,\n\s*alias: Demo3,/);
  await assert.rejects(
    generateLiveRegistry(directory, { cn: { missing: "en/field/reuse.tsx" } }),
    /reuse must refer to the matching English demo/,
  );
  await assert.rejects(
    generateLiveRegistry(directory, { cn: { basic: "cn/../private.tsx" } }),
    /Unsafe localized live demo path/,
  );
  await writeFile(
    path.join(directory, "src/demos/cn/field/basic.tsx"),
    "export default function Demo() { return 'English clone'; }\n",
  );
  assert.deepEqual((await generateLiveRegistry(directory, localized)).cn, localized.cn);
});
