import path from "node:path";
import { createHash } from "node:crypto";
import os from "node:os";
const root = import.meta.dirname,
  repo = path.resolve(root, "../..");
const hash = async (file) =>
  createHash("sha256")
    .update(new Uint8Array(await Bun.file(file).arrayBuffer()))
    .digest("hex");
const files = {};
files["common.css"] = await hash(path.join(root, ".cache/common.css"));
files["exact-app/app.contract"] = await hash(path.join(root, ".cache/exact-app/app.contract"));
for (const group of ["react", "exact"])
  for (const file of new Bun.Glob("**/*.{js,css,html}").scanSync({
    cwd: path.join(root, ".cache", group),
  }))
    files[`${group}/${file}`] = await hash(path.join(root, ".cache", group, file));
const git = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: repo });
await Bun.write(
  path.join(root, "results/provenance.json"),
  JSON.stringify(
    {
      date: new Date().toISOString(),
      commit: git.stdout.toString().trim(),
      note: "Dirty local checkout. SHA256 entries identify the actual frozen bundles tested, not a clean-commit claim.",
      os: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpu: os.cpus()[0]?.model,
      cores: os.cpus().length,
      bun: Bun.version,
      files,
    },
    null,
    2,
  ),
);
