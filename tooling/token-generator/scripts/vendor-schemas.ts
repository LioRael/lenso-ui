import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const schemas = {
  format: "https://www.designtokens.org/schemas/2025.10/format.json",
  resolver: "https://www.designtokens.org/schemas/2025.10/resolver.json",
} as const;
const outputRoot = path.resolve(import.meta.dirname, "../schemas");
await mkdir(outputRoot, { recursive: true });

const lock: Record<string, { sha256: string; url: string }> = {};
for (const [name, url] of Object.entries(schemas)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  const source = await response.text();
  JSON.parse(source);
  const normalizedSource = `${source.trim()}\n`;
  lock[name] = {
    sha256: createHash("sha256").update(normalizedSource).digest("hex"),
    url,
  };
  await writeFile(path.join(outputRoot, `${name}.json`), normalizedSource);
}
await writeFile(path.join(outputRoot, "lock.json"), `${JSON.stringify(lock, null, 2)}\n`);
