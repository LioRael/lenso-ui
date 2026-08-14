import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(packageRoot, "src");
const outputRoot = path.join(packageRoot, "dist");

await mkdir(outputRoot, { recursive: true });
await Promise.all(
  ["consumer-theme.ts.txt", "contract.json", "figma-map.json", "styles.css", "tokens.json"].map(
    (file) => copyFile(path.join(sourceRoot, file), path.join(outputRoot, file)),
  ),
);
