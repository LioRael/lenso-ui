import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const [manifestFile, ...extra] = process.argv.slice(2);
if (!manifestFile || extra.length)
  throw new Error("Provide the legal owner's verified native-declaration-licenses-upgraded.json");
const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
const destination = new URL("../licenses/", import.meta.url);
const packages = [];
const verified = [];
for (const record of manifest.results) {
  if (record.noticeFilesFound?.length)
    throw new Error(`Review new upstream NOTICE assets for ${record.name}`);
  const assets = [];
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
    license: record.assets[0].actualLicense,
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
