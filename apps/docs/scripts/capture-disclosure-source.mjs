// Public reference capture only; prepare-docs never fetches source.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const revision = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
export const sourcePins = {
  "en/disclosure/basic.tsx": "7bc9e387c2cfc9f7df0a0d9e751dbba01a72de22b7f8ebba7987d23bb5b1b54e",
  "en/disclosure/render-function.tsx":
    "6ef00d46d2b622b5821cb746908ca8dac39e44152d36a3b4962fef8f47897972",
  "en/disclosure-group/basic.tsx":
    "89164db9d79e2b849cdaac9495ef26fb058dac14a164030a218b33c683c45098",
  "en/disclosure-group/controlled.tsx":
    "8ad0654b72c71e4c3c28941a19ab93e1690ca71589b6f6520c5b1f6d73f0c0dc",
  "cn/disclosure/basic.tsx": "68a5d7d5deaddb92ff9541639f79f1a6b03536add4851f7a0cc10fca9828e599",
  "cn/disclosure/render-function.tsx":
    "01611713aaa167b296005342635bcd88af1afa944249c8c725e819a6026bc235",
  "cn/disclosure-group/basic.tsx":
    "30858d6ebb60fe3a6e8fed79df6edf0ff7f959fca8a721067bca40256f42327b",
  "cn/disclosure-group/controlled.tsx":
    "84ea74396ed1df40298cd2a270932bcdf226ca61186aecfc6bcb40844536a412",
};
export const sourceUrl = (file) =>
  `https://raw.githubusercontent.com/heroui-inc/heroui/${revision}/apps/docs/src/demos/${file}`;
export const implementationPins = {
  "en/disclosure/basic.tsx": "f745c1f991e2df40700852d865f57ed0a4c81cb502de61188094b00cd9849009",
  "en/disclosure/render-function.tsx":
    "e734817d6efc2ae05a06de27fbb61762c53a39607fec07039cb02b9227a49318",
  "en/disclosure-group/basic.tsx":
    "ba5ff234d2d279b5786a957447d5625863db7dad847f14e1ef9ee3ad8a64d1e8",
  "en/disclosure-group/controlled.tsx":
    "8571c5b31382d9319577300f1a88b284a137a09cf4aa96174c5952519b6ac933",
  "en/disclosure/native-reference.stylex.ts":
    "798e3899b4cb2c14df91ae1a779c9a79ca81dd28a13dcd6462ca72ec94bbd247",
  "en/disclosure-group/native-reference.stylex.ts":
    "d20dffb367fff89a7ab22c11b50d3bac594241498ca27f9097afe75b5f847c35",
};
export const outputPins = {
  "cn/disclosure/basic.tsx": "725757110a25664fbc81aae19d488842d5eafbfdfccb59576e72d18f0238b0dd",
  "cn/disclosure/render-function.tsx":
    "d2ab69dae736cb8501cc63ba8f032054691cc1e1d34dce54e786c280d0873b87",
  "cn/disclosure-group/basic.tsx":
    "375d6e89ac92d103124efe8f4f4abe55d328c3cfb059ff8721982d31bd2f11fa",
  "cn/disclosure-group/controlled.tsx":
    "bff7c6f56c549807a67b9ae87b8011a75bf4b1e833237c8c414a1a529c8c0e17",
};
const digest = (value) => createHash("sha256").update(value).digest("hex");
export async function verifyDisclosureInputs(directory) {
  const capture = verifySourceCapture(
    JSON.parse(await readFile(path.join(directory, "reference/disclosure-source.json"), "utf8")),
  );
  for (const [file, expected] of Object.entries(implementationPins)) {
    if (digest(await readFile(path.join(directory, "src/demos", file), "utf8")) !== expected)
      throw new Error(`Pinned disclosure React implementation changed: ${file}`);
  }
  return capture;
}
export function verifyDisclosureOutput(file, code) {
  if (digest(code) !== outputPins[file])
    throw new Error(`Pinned Chinese disclosure output changed: ${file}`);
}
export async function verifyDisclosureOutputs(directory) {
  for (const file of Object.keys(outputPins))
    verifyDisclosureOutput(file, await readFile(path.join(directory, "src/demos", file), "utf8"));
}
export async function verifyDisclosureProvenance(directory, modules) {
  for (const [output, expected] of Object.entries(outputPins)) {
    const file = output.replace(/^cn\//, "en/");
    const evidence = modules[file];
    if (
      evidence?.status !== "source-backed-localized" ||
      evidence.sourceAvailability !== "hash-pinned-public-upstream" ||
      evidence.output !== output ||
      evidence.outputSha256 !== expected ||
      JSON.stringify(evidence.implementationPins) !== JSON.stringify(implementationPins)
    )
      throw new Error(`Invalid disclosure projection provenance: ${file}`);
    for (const locale of ["en", "cn"]) {
      const source = file.replace(/^en\//, `${locale}/`);
      const record = `content/examples/${source.replace(/\.tsx$/, ".json")}`;
      const archive = JSON.parse(await readFile(path.join(directory, record), "utf8"));
      if (
        evidence.records[locale] !== record ||
        evidence.sourceHashes[locale] !== sourcePins[source] ||
        evidence.publicSources[locale].sha256 !== sourcePins[source] ||
        evidence.publicSources[locale].url !== sourceUrl(source) ||
        evidence.archivedExclusions[locale] !== archive.excludedReason ||
        typeof archive.code === "string" ||
        !archive.excludedReason
      )
        throw new Error(`Invalid disclosure public-source provenance: ${source}`);
    }
  }
}

export function verifySourceCapture(capture) {
  if (capture.revision !== revision || capture.license !== "Apache-2.0")
    throw new Error("Unexpected disclosure source capture revision or license");
  if (Object.keys(capture.sources).sort().join() !== Object.keys(sourcePins).sort().join())
    throw new Error("Unexpected disclosure source capture files");
  for (const [file, sha256] of Object.entries(sourcePins)) {
    const entry = capture.sources[file];
    if (
      entry.url !== sourceUrl(file) ||
      entry.sha256 !== sha256 ||
      typeof entry.code !== "string" ||
      digest(entry.code) !== sha256
    )
      throw new Error(`Pinned public disclosure source changed: ${file}`);
  }
  return capture;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const capture = { revision, license: "Apache-2.0", sources: {} };
  for (const [file, sha256] of Object.entries(sourcePins)) {
    const url = sourceUrl(file);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Public source capture failed: ${response.status} ${url}`);
    capture.sources[file] = { url, sha256, code: await response.text() };
  }
  verifySourceCapture(capture);
  const destination = new URL("../reference/disclosure-source.json", import.meta.url);
  await mkdir(new URL("../reference/", import.meta.url), { recursive: true });
  await writeFile(destination, JSON.stringify(capture, null, 2) + "\n");
}
