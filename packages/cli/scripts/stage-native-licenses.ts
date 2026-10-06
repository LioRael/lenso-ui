import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const [manifestFile, ...extra] = process.argv.slice(2);
if (!manifestFile || extra.length)
  throw new Error("Provide the legal owner's verified native-declaration-licenses-upgraded.json");
interface Asset {
  distribution: string;
  source: string;
  sourceViaApprovedFixture?: string;
  sha256: string;
  bytes: number;
  copyrights: string[];
  actualLicense: string;
}
interface RecordEntry {
  name: string;
  version: string;
  noticeFilesFound: string[];
  assets: Asset[];
}
function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Expected a verified native-license record");
  return input as Record<string, unknown>;
}
function text(input: unknown): string {
  if (typeof input !== "string" || !input.length) throw new Error("Invalid native-license string");
  return input;
}
function strings(input: unknown): string[] {
  if (!Array.isArray(input)) throw new Error("Expected native-license string array");
  return input.map(text);
}
const input: unknown = JSON.parse(await readFile(manifestFile, "utf8"));
const results = object(input)["results"];
if (!Array.isArray(results)) throw new Error("Verified license manifest lacks results");
const records: RecordEntry[] = results.map((input: unknown) => {
  const record = object(input);
  const assets = record["assets"];
  if (!Array.isArray(assets) || !assets.length)
    throw new Error("Verified license record must include original assets");
  return {
    name: text(record["name"]),
    version: text(record["version"]),
    noticeFilesFound:
      record["noticeFilesFound"] === undefined ? [] : strings(record["noticeFilesFound"]),
    assets: assets.map((input: unknown) => {
      const asset = object(input);
      const bytes = asset["bytes"];
      if (typeof bytes !== "number" || !Number.isSafeInteger(bytes) || bytes < 0)
        throw new Error("Invalid native-license byte length");
      return {
        distribution: text(asset["distribution"]),
        source: text(asset["source"]),
        ...(asset["sourceViaApprovedFixture"] === undefined
          ? {}
          : { sourceViaApprovedFixture: text(asset["sourceViaApprovedFixture"]) }),
        sha256: text(asset["sha256"]),
        bytes,
        copyrights: strings(asset["copyrights"]),
        actualLicense: text(asset["actualLicense"]),
      };
    }),
  };
});
const destination = new URL("../licenses/", import.meta.url);
const packages: {
  name: string;
  version: string;
  license: string;
  assets: { file: string; sha256: string; copyrights: string[] }[];
}[] = [];
const verified: { file: string; bytes: Buffer }[] = [];
for (const record of records) {
  if (record.noticeFilesFound?.length)
    throw new Error(`Review new upstream NOTICE assets for ${record.name}`);
  const assets: { file: string; sha256: string; copyrights: string[] }[] = [];
  for (const asset of record.assets) {
    if (!/^dist\/licenses\/[a-zA-Z0-9.-]+$/.test(asset.distribution))
      throw new Error(`Unsafe license destination: ${asset.distribution}`);
    const bytes = await readFile(asset.sourceViaApprovedFixture ?? asset.source);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== asset.sha256 || bytes.length !== asset.bytes)
      throw new Error(
        `Original license bytes changed for ${record.name}; request a fresh legal audit`,
      );
    const file = asset.distribution.slice("dist/licenses/".length);
    verified.push({ file, bytes });
    assets.push({ file, sha256: digest, copyrights: asset.copyrights });
  }
  packages.push({
    name: record.name,
    version: record.version,
    license: record.assets[0]!.actualLicense,
    assets,
  });
}
await mkdir(destination, { recursive: true });
for (const { file, bytes } of verified) await writeFile(new URL(file, destination), bytes);
await writeFile(
  new URL("native-declarations.json", destination),
  JSON.stringify(
    {
      formatVersion: 1,
      packages,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    packages.map(({ name, version }) => ({ name, version })),
    null,
    2,
  ),
);
