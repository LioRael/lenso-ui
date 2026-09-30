import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upstream } from "./upstream-contract.mjs";
import { generateLiveRegistry } from "./generate-live-registry.mjs";
import { generateApiReference } from "./generate-api-reference.mjs";
import { reportCoverage } from "./report-coverage.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const hash = (text) => createHash("sha256").update(text).digest("hex");
const manifest = JSON.parse(
  await readFile(path.join(root, "content/upstream-manifest.json"), "utf8"),
);
if (manifest.commit !== upstream.commit || manifest.repository !== upstream.repository) {
  throw new Error("Documentation provenance does not match the pinned upstream contract.");
}
for (const [file, expected] of Object.entries(manifest.files)) {
  const target = path.resolve(root, file);
  if (!target.startsWith(root) || file.split("/").includes(".."))
    throw new Error(`Unsafe content path: ${file}`);
  if (
    !target.startsWith(`${root}content/`) &&
    !/^public\/(?:fonts\/|assets\/images\/|images\/mcp-)/.test(file)
  )
    throw new Error(`Unsafe content path: ${file}`);
  if (hash(await readFile(target)) !== expected.sha256) {
    throw new Error(
      `Imported content changed: ${file}. Update the importer, not generated content.`,
    );
  }
}
const indexText = await readFile(path.join(root, "content/source-index.json"), "utf8");
if (hash(indexText) !== manifest.indexSha256) throw new Error("Source index has drifted.");
const { pages, examples } = JSON.parse(indexText);
for (const locale of upstream.locales) {
  const count = pages.filter((page) => page.locale === locale).length;
  console.log(
    `${locale}: ${count} documentation pages; ${Object.keys(examples[locale]).length} registered demo references (Native exclusions recorded explicitly).`,
  );
}
await generateLiveRegistry();
await generateApiReference();
await reportCoverage();
console.log(
  "Pinned documentation integrity verified. See /coverage for live-preview migration status.",
);
