import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adaptContent, pageSlug, upstream } from "./upstream-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = process.argv[process.argv.indexOf("--source") + 1];
if (!process.argv.includes("--source") || !source) {
  throw new Error("Usage: node scripts/import-upstream.mjs --source <pinned HeroUI checkout>");
}
const git = (...args) =>
  execFileSync("git", ["-C", source, ...args], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
if (git("rev-parse", "HEAD").trim() !== upstream.commit) {
  throw new Error(`Refusing unpinned source. Expected ${upstream.commit}.`);
}
if (git("status", "--porcelain", "--", "apps/docs").trim()) {
  throw new Error("Refusing a modified documentation source checkout.");
}
const paths = git("ls-tree", "-r", "--name-only", "HEAD", "apps/docs").trim().split("\n");
const files = {};
const pages = [];
const examples = {};
const unregisteredSources = [];
const excludedExamples = [];
const read = (file) => git("show", `${upstream.commit}:${file}`);
const relationshipSource =
  read("apps/docs/src/components-registry.ts")
    .split("const componentRelationships:")[1]
    ?.split("};")[0] ?? "";
const relationships = Object.fromEntries(
  [...relationshipSource.matchAll(/(\w+):\s*\[([\s\S]*?)\]/g)].map(([, name, values]) => [
    name,
    [...values.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
  ]),
);
if (!Object.keys(relationships).length)
  throw new Error("Pinned component relationship metadata could not be parsed.");
const digest = (text) => createHash("sha256").update(text).digest("hex");
async function write(file, text, original) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), text);
  files[file] = { sha256: digest(text), source: original };
}

for (const locale of upstream.locales) {
  const prefix = `apps/docs/content/docs/${locale}/react/`;
  for (const original of paths.filter((file) => file.startsWith(prefix))) {
    if (!/\.(mdx|json)$/.test(original)) continue;
    const file = original.replace(/^apps\/docs\//, "");
    const text = adaptContent(read(original));
    await write(file, text, original);
    if (file.endsWith(".mdx")) {
      const frontmatter = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const field = (key) =>
        (frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1] ?? "").replace(
          /^["']|["']$/g,
          "",
        );
      pages.push({
        locale,
        slug: pageSlug(file),
        file,
        title: field("title"),
        description: field("description"),
        previews: [...text.matchAll(/<ComponentPreview\b[^>]*?\bname=["']([^"']+)["']/g)].map(
          (match) => match[1],
        ),
      });
    }
  }
  const registrySource = read(`apps/docs/src/demos/${locale}/index.ts`);
  const entries = [
    ...registrySource.matchAll(
      /"([^"]+)":\s*\{\s*loader:\s*\(\)\s*=>\s*import\("([^"]+)"\)\.then\(\s*\(m\)\s*=>\s*m\.(\w+),?\s*\),\s*file:\s*"([^"]+)"/g,
    ),
  ];
  examples[locale] = {};
  for (const [, name, , exported, relative] of entries) {
    const original = `apps/docs/src/demos/${relative}`;
    if (!paths.includes(original)) throw new Error(`Missing upstream demo: ${original}`);
    const code = adaptContent(read(original));
    const file = `content/examples/${relative.replace(/\.tsx$/, ".json")}`;
    const excludedReason = /HeroUI Native|qr-code-native|heroui-native|App Store|Expo/.test(code)
      ? "Native product example intentionally excluded; its composition is adapted independently for React documentation."
      : undefined;
    if (excludedReason)
      excludedExamples.push({ locale, name, source: original, reason: excludedReason });
    await write(
      file,
      `${JSON.stringify({ name, exported, source: original, ...(excludedReason ? { excludedReason } : { code }) }, null, 2)}\n`,
      original,
    );
    examples[locale][name] = { file, exported, source: original };
  }
  for (const original of paths.filter(
    (file) => file.startsWith(`apps/docs/src/demos/${locale}/`) && file.endsWith(".tsx"),
  )) {
    const file = original
      .replace(/^apps\/docs\/src\/demos\//, "content/examples/")
      .replace(/\.tsx$/, ".json");
    if (files[file]) continue;
    await write(
      file,
      `${JSON.stringify({ source: original, code: adaptContent(read(original)) }, null, 2)}\n`,
      original,
    );
    unregisteredSources.push({ locale, file, source: original });
  }
}

for (const original of paths.filter((file) =>
  /^apps\/docs\/public\/(?:fonts\/|assets\/images\/|images\/mcp-)/.test(file),
)) {
  const file = original.replace(/^apps\/docs\//, "");
  const bytes = execFileSync("git", ["-C", source, "show", `${upstream.commit}:${original}`], {
    maxBuffer: 32 * 1024 * 1024,
  });
  await write(file, bytes, original);
}

const duplicate = pages.find(
  (page, index) =>
    pages.findIndex((other) => other.locale === page.locale && other.slug === page.slug) !== index,
);
if (duplicate) throw new Error(`Duplicate route: ${duplicate.locale}/${duplicate.slug}`);
const unresolvedPreviews = [];
const aliases = { "text-field-basic": "textfield-basic" };
for (const page of pages) {
  for (const name of page.previews) {
    if (aliases[name] && examples[page.locale][aliases[name]]) {
      examples[page.locale][name] = {
        ...examples[page.locale][aliases[name]],
        aliasOf: aliases[name],
      };
    }
    if (!examples[page.locale][name] && !examples.en[name]) {
      unresolvedPreviews.push({ page: page.file, name });
    }
  }
}
await writeFile(
  path.join(root, "content/source-index.json"),
  `${JSON.stringify({ pages, examples, relationships, unresolvedPreviews, unregisteredSources, excludedExamples }, null, 2)}\n`,
);
await writeFile(
  path.join(root, "content/upstream-manifest.json"),
  `${JSON.stringify(
    {
      ...upstream,
      scope: "React documentation and registered React demo source, both upstream locales",
      exclusions: [
        "Native application",
        "commercial product UI",
        "authentication",
        "analytics",
        "publishing integrations",
      ],
      adaptations: ["package import paths", "local MDX component imports resolved by the renderer"],
      files,
      indexSha256: digest(await readFile(path.join(root, "content/source-index.json"), "utf8")),
    },
    null,
    2,
  )}\n`,
);
console.log(
  `Imported ${pages.length} pages and ${Object.values(examples).reduce((n, registry) => n + Object.keys(registry).length, 0)} registered demo sources from ${upstream.commit}.`,
);
if (unresolvedPreviews.length)
  console.log("Unresolved references already present in pinned upstream:", unresolvedPreviews);
