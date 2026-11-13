import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const [target, ...extra] = process.argv.slice(2);
if (!target || extra.length) throw new Error("Usage: bun run docs:create <directory>");
const destination = path.resolve(target);
async function run(args: string[], cwd = root) {
  const child = spawn("bun", args, { cwd, stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`bun ${args[0]} exited ${signal ?? code}.`));
    });
  });
}
const packed = await mkdtemp(path.join(tmpdir(), "lenso-docs-pack-"));
try {
  console.log("Building Lenso Docs and its dependencies…");
  // Build the distributable entries; contributor verification runs separately.
  for (const name of ["tokens", "glass", "primitives", "ui", "docs"])
    await run(["run", "build"], path.join(root, "packages", name));
  for (const name of ["tokens", "glass", "primitives", "ui", "docs"])
    await run(
      ["pm", "pack", "--destination", packed, "--ignore-scripts"],
      path.join(root, "packages", name),
    );
  await run(["packages/create-docs/src/cli.ts", destination, "--packages", packed]);
} finally {
  await rm(packed, { recursive: true, force: true });
}
