import { generateDocsManifest } from "@lenso/docs/generate";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const tabs = [
  ["start", "Start"],
  ["foundations", "Foundations"],
  ["components", "Components"],
  ["primitives", "Primitives"],
  ["patterns", "Patterns"],
  ["templates", "Templates"],
  ["guides", "Guides"],
].map(([path, label]) => ({ path, label }));

await generateDocsManifest({
  contentDir: path.join(root, "contents"),
  outputFile: path.join(root, "contents", "manifest.json"),
  publicDir: path.join(root, "public"),
  site: process.env.LENSO_DOCS_SITE ?? "https://ui.lenso.dev",
  tabs,
  overrides: {
    "start/release-status": { hidden: true },
    "patterns/quick-link": { aliases: ["/components/quick-link"] },
    "patterns/settings-row": { aliases: ["/components/settings-row"] },
  },
});
