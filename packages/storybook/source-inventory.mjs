import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const sourcePin = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const repository = "https://github.com/heroui-inc/heroui";
const prefix = "packages/react/src/components/";
const arguments_ = process.argv.slice(2);
const json = arguments_.includes("--json");
const localSourceDirectory = arguments_.find((argument) => argument !== "--json");
const pinnedFiles = JSON.parse(
  await readFile(new URL("./pinned-story-files.json", import.meta.url), "utf8"),
);
if (pinnedFiles.commit !== sourcePin)
  throw new Error("Pinned story file inventory commit mismatch");
const storyDirectory = fileURLToPath(new URL("./stories/", import.meta.url));
const reviewedFamilies = new Set([
  "alert",
  "avatar",
  "avatar-group",
  "badge",
  "card",
  "chip",
  "fieldset",
  "input",
  "input-group",
  "kbd",
  "meter",
  "progress-bar",
  "progress-circle",
  "scroll-shadow",
  "separator",
  "skeleton",
  "spinner",
  "surface",
  "textarea",
  "textfield",
  "typography",
]);

async function getText(url) {
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`${response.status}: ${url}`);
      return await response.text();
    } catch (error) {
      failure = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error(`Could not retrieve pinned source ${url}`, { cause: failure });
}

const paths = pinnedFiles.families
  .map((family) => `${prefix}${family}/${family}.stories.tsx`)
  .sort();

const localFiles = new Set(await readdir(storyDirectory));
const inventory = [];
for (let offset = 0; offset < paths.length; offset += 8) {
  inventory.push(
    ...(await Promise.all(
      paths.slice(offset, offset + 8).map(async (path) => {
        const filename = path.split("/").at(-1);
        const family = path.split("/").at(-2);
        const source = localSourceDirectory
          ? await readFile(join(localSourceDirectory, filename), "utf8")
          : await getText(
              `https://raw.githubusercontent.com/heroui-inc/heroui/${sourcePin}/${path}`,
            );
        const names = [...source.matchAll(/^export const (\w+)/gm)].map((match) => match[1]);
        if (!names.length) throw new Error(`No upstream story exports found in ${path}`);
        const local = localFiles.has(filename)
          ? await readFile(join(storyDirectory, filename), "utf8")
          : "";
        const exports = new Set(
          [...local.matchAll(/^export const (\w+)/gm)].map((match) => match[1]),
        );
        const implemented = reviewedFamilies.has(family)
          ? names.filter((name) => exports.has(name))
          : [];
        return { filename, family, path, names, implemented };
      }),
    )),
  );
}

const total = inventory.reduce((count, item) => count + item.names.length, 0);
const implemented = inventory.reduce((count, item) => count + item.implemented.length, 0);
if (inventory.length !== 68 || total !== 583) {
  throw new Error(
    `Incomplete pinned source inventory: ${inventory.length} files, ${total} exports`,
  );
}
if (json) {
  console.log(
    JSON.stringify(
      {
        source: { repository, version: "3.2.6", commit: sourcePin },
        files: inventory.map(({ filename, family, path, names, implemented }) => ({
          filename,
          family,
          path,
          url: `${repository}/blob/${sourcePin}/${path}`,
          sourceExports: names,
          scenarios: names.map((sourceExport) => ({
            sourceExport,
            localFile: implemented.includes(sourceExport) ? `stories/${filename}` : null,
            localExport: implemented.includes(sourceExport) ? sourceExport : null,
            status: implemented.includes(sourceExport) ? "adapted-unverified" : "unimplemented",
          })),
        })),
        totals: {
          files: inventory.length,
          sourceScenarios: total,
          adaptedScenarios: implemented,
        },
      },
      null,
      2,
    ),
  );
} else {
  console.log("# Pinned component story inventory\n");
  console.log(`HeroUI v3.2.6, commit \`${sourcePin}\`.\n`);
  console.log("Names come from actual named exports, not a generated variant matrix.");
  console.log("Implemented means reviewed source adaptation; it does not mean browser parity.");
  console.log("Legacy local states are not counted solely because their export names match.\n");
  console.log("| Source file | Upstream scenarios | Adapted scenarios | Remaining |");
  console.log("| --- | --- | --- | --- |");
  for (const { family, path, names, implemented } of inventory) {
    console.log(
      `| [${family}](${repository}/blob/${sourcePin}/${path}) | ${names.join(", ")} | ${implemented.join(", ") || "None"} | ${names.filter((name) => !implemented.includes(name)).join(", ") || "None"} |`,
    );
  }
  console.log(
    `\n${inventory.length} source files; ${total} upstream scenarios; ${implemented} reviewed local adaptations; ${total - implemented} remaining.`,
  );
}
