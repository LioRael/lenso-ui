import { spawnSync } from "node:child_process";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const generatedPaths = [
  "apps/docs/public/r",
  "packages/tokens/src/consumer-theme.ts.txt",
  "packages/tokens/src/contract.json",
  "packages/tokens/src/figma-map.json",
  "packages/tokens/src/index.ts",
  "packages/tokens/src/styles.css",
  "packages/tokens/src/tokens.json",
  "packages/tokens/src/tokens.stylex.ts",
  "packages/ui/src/tokens.stylex.ts",
  "registry/components",
  "registry/parity-manifest.json",
  "registry/recipes/sidebar.json",
  "registry/registry.json",
  "registry/setup/setup.json",
  "registry/tokens.stylex.ts",
];

function git(args: string[]): string {
  const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

const changed = git(["diff", "--name-only", "--", ...generatedPaths]);
const untracked = git(["ls-files", "--others", "--exclude-standard", "--", ...generatedPaths]);
const drift = [changed, untracked].filter(Boolean).join("\n");
if (drift) throw new Error(`Generated artifacts are not fresh:\n${drift}`);
