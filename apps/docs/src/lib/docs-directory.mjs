import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function docsDirectory(cwd) {
  if (cwd === undefined) return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const nested = path.join(cwd, "apps/docs");
  return existsSync(path.join(nested, "package.json")) ? nested : cwd;
}
