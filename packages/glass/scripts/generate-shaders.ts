import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const generated = join(root, "src/shared-core/generated");
await mkdir(generated, { recursive: true });
const shaders = await Promise.all(
  ["quad.vert", "blur.frag", "ios27.frag"].map((file) =>
    readFile(join(root, "shaders", file), "utf8"),
  ),
);
await writeFile(
  join(generated, "shaders.ts"),
  `// Generated from shaders by scripts/generate-shaders.ts.\nexport const shaders = [\n${shaders.map((source) => `  ${JSON.stringify(source)},`).join("\n")}\n];\n`,
);
