import assert from "node:assert/strict";
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const compiler = process.env["EXACT_CONTRACT_BIN"];
if (!compiler) throw new Error("Set EXACT_CONTRACT_BIN to the pinned stock contract compiler");
const cache = path.resolve(
  process.env["EXACT_COMPOSITION_CACHE"] ?? path.join(root, ".cache/primitive-composition"),
);
const primitiveRoot = path.resolve(root, "../primitives-exact");
const library = await Bun.file(path.join(primitiveRoot, "package.json")).json();
const installed = path.join(cache, "node_modules", library.name);
await mkdir(installed, { recursive: true });
for (const file of ["package.json", ...library.files])
  await cp(path.join(primitiveRoot, file), path.join(installed, file), { recursive: true });
await Bun.write(
  path.join(cache, "app.json"),
  JSON.stringify(await Bun.file(path.join(root, "example/app.json")).json()),
);
const input =
  'Input(id="field", label="Name", description="", value="", type="text", placeholder="", disabled=false, readOnly=false, invalid=false, input=edit, change=edit, submit=submit';
const prelude =
  'use Input from "@lenso/primitives-exact"\ncomponent App\n  action edit(value: string)\n    let current = value\n  action submit\n    let submitted = true\n  view\n';
const cases = [
  { name: "primitive-input", source: prelude + `    ${input})\n`, accepted: true },
  {
    name: "primitive-input-hatch",
    source: prelude + `    ${input}, hatch="lenso-ui")\n`,
    accepted: false,
    diagnostic: "type-unknown-prop",
  },
  {
    name: "primitive-input-padding",
    source: prelude + `    ${input}, padding=8)\n`,
    accepted: false,
    diagnostic: "type-unknown-prop",
  },
  {
    name: "primitive-input-wrapper",
    source: prelude + `    box padding=8\n      ${input})\n`,
    accepted: true,
  },
  {
    name: "dynamic-native-hatch",
    source: 'component App\n  state owner = "lenso-ui"\n  view\n    text "Name" hatch=owner\n',
    accepted: false,
    diagnostic: "lower-hatch-value",
  },
];
const results: { name: string; expected: string; status: number; diagnostics: string }[] = [];
for (const probe of cases) {
  const file = path.join(cache, `${probe.name}.contract`);
  await Bun.write(file, probe.source);
  const child = Bun.spawn([compiler, "build", file, "--errors-only", "-o", `${file}.plan`], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, status] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  const diagnostics = stdout + stderr;
  results.push({
    name: probe.name,
    expected: probe.accepted ? "accepted" : "rejected",
    status,
    diagnostics,
  });
}
await Bun.write(
  path.join(cache, "verification.json"),
  JSON.stringify(
    {
      completedAt: new Date().toISOString(),
      compilerSHA256: createHash("sha256")
        .update(await Bun.file(compiler).bytes())
        .digest("hex"),
      results,
    },
    null,
    2,
  ),
);
for (const [index, probe] of cases.entries()) {
  const result = results[index]!;
  assert.equal(result.status === 0, probe.accepted, result.diagnostics || probe.name);
  if (probe.diagnostic)
    assert.ok(result.diagnostics.includes(probe.diagnostic), result.diagnostics);
}
console.log(`${results.length} stock compiler composition cases passed`);
