import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upstream } from "./upstream-contract.mjs";
import { discoverLiveExamples, generateLiveRegistry } from "./generate-live-registry.mjs";
import { generateLocalizedExamples } from "./localize-live-examples.mjs";
import { writeApiReference } from "./generate-api-reference.mjs";
import { reportCoverage } from "./report-coverage.mjs";
import { writeDocsProjection } from "./docs-projection.mjs";
import { writeLensoContract } from "./generate-lenso-contract.mjs";
import { writeStaticSearch } from "./static-search.mjs";

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
const source = JSON.parse(indexText);
const { pages, examples } = source;
for (const locale of upstream.locales) {
  const count = pages.filter((page) => page.locale === locale).length;
  console.log(
    `${locale}: ${count} private reference pages; ${Object.keys(examples[locale]).length} source scenario references (Native exclusions recorded explicitly).`,
  );
}
await discoverLiveExamples(root, source);
const localized = await generateLocalizedExamples();
await generateLiveRegistry(undefined, localized);
await writeApiReference(undefined, process.env.API_REFERENCE_DEPENDENCY_ROOT);
const authored = await writeDocsProjection();
await writeStaticSearch(authored);
await writeLensoContract(undefined, authored);
await reportCoverage();
console.log(
  "Private reference integrity verified. Public authored content, native API and local-example placement regenerated.",
);
