import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  discoverLiveExamples,
  findDemoExport,
  generateLiveRegistry,
} from "./generate-live-registry.mjs";

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
    "field-controlled": "en/field/controlled.tsx",
    "field-legacy": "en/field/controlled.tsx",
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
    findDemoExport(
      "export const styles = {}; export const Demo = React.memo(() => null);",
      "demo.tsx",
      "Demo",
    ),
    "Demo",
  );
});
