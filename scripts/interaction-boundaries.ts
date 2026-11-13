import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeModuleReferences } from "@lenso/ui-devtools/parser";

const root = fileURLToPath(new URL("..", import.meta.url));

async function sourceFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await sourceFiles(file)));
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) result.push(file);
  }
  return result;
}

const failures: string[] = [];
for (const directory of [
  "packages/glass/src",
  "packages/ui/src",
  "packages/tokens/src",
  "packages/primitives/src",
  "packages/docs/src",
  "packages/docs/presentation",
  "apps/docs/src",
  "packages/storybook/stories",
]) {
  for (const file of await sourceFiles(path.join(root, directory))) {
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    const specialized =
      /\/(?:components|demos\/(?:en|cn))\/(?:calendar|range-calendar|calendar-year-picker|date-|time-|color-)/.test(
        relative,
      );
    const source = await readFile(file, "utf8");
    if (
      /@base-ui\/|data-base-ui-|data-popup-open|baseUIHandlerPrevented|preventBaseUIHandler|\bnativeButton\b/.test(
        source,
      )
    )
      failures.push(`Base UI dependency or contract: ${relative}`);
    for (const module of runtimeModuleReferences(source, relative)) {
      if (/^(?:react-aria(?:-components)?|@react-aria\/)/.test(module))
        failures.push(`React Aria interaction in UI SDK components: ${relative}`);
      if (
        !specialized &&
        module !== "react-stately/Color" &&
        /^(?:react-stately|@react-stately\/)/.test(module)
      )
        failures.push(`Specialized state model outside its boundary: ${relative}`);
      if (/^(?:tailwind-variants|tailwindcss)/.test(module))
        failures.push(`Tailwind runtime in component source: ${relative}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
