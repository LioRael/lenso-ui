import { execFileSync } from "node:child_process";
import { appendFile, readFile, readdir } from "node:fs/promises";
import { packages } from "../../scripts/publish-packages.ts";

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();
const event = JSON.parse(await readFile(process.env["GITHUB_EVENT_PATH"]!, "utf8"));
const run = event.workflow_run;
const head = git("rev-parse", "HEAD");
if (
  process.env["GITHUB_EVENT_NAME"] !== "workflow_run" ||
  run?.event !== "push" ||
  run?.head_branch !== "main" ||
  run?.conclusion !== "success" ||
  run?.head_sha !== head ||
  run?.head_repository?.full_name !== process.env["GITHUB_REPOSITORY"]
)
  throw new Error("release preparation requires successful exact-main push verification");

let mode = "none";
const ui = JSON.parse(await readFile("packages/ui/package.json", "utf8"));
if (git("ls-remote", "origin", "refs/heads/main").split(/\s/)[0] === head) {
  const pending = (await readdir(".changeset")).some(
    (name) => name.endsWith(".md") && name !== "README.md",
  );
  if (pending) mode = "version";
  else {
    const deleted = git(
      "diff",
      "--name-only",
      "--diff-filter=D",
      "HEAD^",
      "HEAD",
      "--",
      ".changeset",
    );
    const consumed = deleted
      .split("\n")
      .some((name) => name.endsWith(".md") && name !== ".changeset/README.md");
    const changed = git("diff", "--name-only", "HEAD^", "HEAD", "--", "packages").split("\n");
    for (const item of packages) {
      const path = `${item.dir}/package.json`;
      if (!consumed || !changed.includes(path)) continue;
      const previous = JSON.parse(git("show", `HEAD^:${path}`));
      const current = JSON.parse(await readFile(path, "utf8"));
      if (previous.version !== current.version) mode = "publish";
    }
  }
}
await appendFile(process.env["GITHUB_OUTPUT"]!, `mode=${mode}\nversion=${ui.version}\n`);
