import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { themes } from "../src/lib/theme-builder-model.ts";

// Explicit source maintenance, not a network-dependent build step.
const commit = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const source = `https://raw.githubusercontent.com/heroui-inc/heroui/${commit}/apps/docs/src/assets/themes`;
const output = new URL("../public/theme-presets/", import.meta.url);
const files = await Promise.all(
  themes.map(async ({ id }) => {
    const file = `${id === "uber" ? "black" : id}.png`;
    const url = `${source}/${file}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      throw new Error(`Not a PNG: ${url}`);
    return { file, url, bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
  }),
);
await mkdir(output, { recursive: true });
for (const { file, bytes } of files) await writeFile(new URL(file, output), bytes);
await writeFile(
  new URL("LICENSE.txt", output),
  await readFile(new URL("../../../third-party/heroui/LICENSE.txt", import.meta.url)),
);
await writeFile(
  new URL("NOTICE.md", output),
  await readFile(new URL("../../../third-party/heroui/NOTICE.md", import.meta.url)),
);
await writeFile(
  new URL("provenance.json", output),
  JSON.stringify(
    {
      source: "HeroUI v3.2.6",
      commit,
      license: "Apache-2.0",
      modification: "Unmodified source PNGs; served locally by Lenso.",
      files: files.map(({ file, url, sha256 }) => ({ file, url, sha256 })),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Synced ${files.length} pinned Theme Builder PNGs and their license.`);
