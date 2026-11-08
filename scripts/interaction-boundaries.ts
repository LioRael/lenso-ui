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
  "apps/docs/src",
  "packages/storybook/stories",
]) {
  for (const file of await sourceFiles(path.join(root, directory))) {
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    const specialized =
      /\/(?:components|demos\/(?:en|cn))\/(?:calendar|range-calendar|calendar-year-picker|date-|time-|color-)/.test(
        relative,
      );
    const colorStateHelper = relative === "packages/ui/src/utils/color-state.tsx";
    for (const module of runtimeModuleReferences(await readFile(file, "utf8"), relative)) {
      if (/^(?:react-aria(?:-components)?|@react-aria\/)/.test(module))
        failures.push(`React Aria interaction in Base UI reconstruction: ${relative}`);
      if (
        !specialized &&
        module !== "react-stately/Color" &&
        !(colorStateHelper && module === "react-stately/useColorPickerState") &&
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
