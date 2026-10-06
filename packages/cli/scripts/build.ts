import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { buildDistribution } from "./distribution.ts";

export async function buildDeveloperTool(name: "cli" | "mcp"): Promise<void> {
  execFileSync("pnpm", ["--filter", "@lenso/ui-docs", "generate:contract"], {
    stdio: "inherit",
  });
  await buildDistribution(name);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildDeveloperTool("cli");
}
