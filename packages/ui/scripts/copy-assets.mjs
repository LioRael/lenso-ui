import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await copyFile(
  path.join(packageRoot, "src/preflight.css"),
  path.join(packageRoot, "dist/preflight.css"),
);
await copyFile(
  path.join(packageRoot, "src/disclosure/disclosure-chevron.svg"),
  path.join(packageRoot, "dist/disclosure/disclosure-chevron.svg"),
);
