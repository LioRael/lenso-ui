#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { buildDistribution } from "./distribution.ts";
export { buildDistribution } from "./distribution.ts";

export async function buildDeveloperTool(name: "cli" | "mcp"): Promise<void> {
  execFileSync("bun", ["run", "--filter", "@lenso/ui-docs", "generate:contract"], {
    stdio: "inherit",
  });
  await buildDistribution(name);
}

if (import.meta.main) {
  const name = process.argv[2];
  if (name !== "cli" && name !== "mcp") throw new Error("Usage: lenso-tool-build <cli|mcp>");
  await buildDeveloperTool(name);
}
