import { existsSync } from "node:fs";
import path from "node:path";

export function docsDirectory(cwd = process.cwd()) {
  const nested = path.join(cwd, "apps/docs");
  return existsSync(path.join(nested, "package.json")) ? nested : cwd;
}
