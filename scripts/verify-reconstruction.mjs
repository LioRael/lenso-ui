import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeModuleReferences } from "./source-imports.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const families = [
  "accordion",
  "alert",
  "alert-dialog",
  "autocomplete",
  "avatar",
  "avatar-group",
  "badge",
  "breadcrumbs",
  "button",
  "button-group",
  "calendar",
  "calendar-year-picker",
  "card",
  "checkbox",
  "checkbox-group",
  "chip",
  "close-button",
  "color-area",
  "color-field",
  "color-input-group",
  "color-picker",
  "color-slider",
  "color-swatch",
  "color-swatch-picker",
  "combo-box",
  "date-field",
  "date-input-group",
  "date-picker",
  "date-range-picker",
  "description",
  "disclosure",
  "disclosure-group",
  "drawer",
  "dropdown",
  "empty-state",
  "error-message",
  "field-error",
  "fieldset",
  "form",
  "header",
  "input",
  "input-group",
  "input-otp",
  "kbd",
  "label",
  "link",
  "list-box",
  "list-box-item",
  "list-box-section",
  "menu",
  "menu-item",
  "menu-section",
  "meter",
  "modal",
  "number-field",
  "pagination",
  "popover",
  "progress-bar",
  "progress-circle",
  "radio",
  "radio-group",
  "range-calendar",
  "scroll-shadow",
  "search-field",
  "select",
  "separator",
  "skeleton",
  "slider",
  "spinner",
  "surface",
  "switch",
  "switch-group",
  "table",
  "tabs",
  "tag",
  "tag-group",
  "textarea",
  "textfield",
  "time-field",
  "toast",
  "toggle-button",
  "toggle-button-group",
  "toolbar",
  "tooltip",
  "typography",
];
const failures = [];

for (const family of families) {
  for (const packageName of ["react", "styles"]) {
    const entry = `packages/${packageName}/src/components/${family}/index.ts`;
    try {
      const source = await readFile(path.join(root, entry), "utf8");
      if (!source.trim()) failures.push(`Empty component entry: ${entry}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      failures.push(`Missing source family: ${entry}`);
    }
  }
}

for (const legacy of ["ui", "tokens", "docs", "fonts", "design-lint"]) {
  try {
    await readFile(path.join(root, "packages", legacy, "package.json"));
    failures.push(`Obsolete package remains: packages/${legacy}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function sourceFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await sourceFiles(file)));
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) result.push(file);
  }
  return result;
}

const runtimeFiles = [
  ...(await sourceFiles(path.join(root, "packages/react/src"))),
  ...(await sourceFiles(path.join(root, "apps/docs/src/demos"))),
];
for (const file of runtimeFiles) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const specialized =
    /\/(?:components|demos\/(?:en|cn))\/(?:calendar|range-calendar|calendar-year-picker|date-|time-|color-)/.test(
      relative,
    );
  const source = await readFile(file, "utf8");
  for (const module of runtimeModuleReferences(source, relative)) {
    if (
      !specialized &&
      /^(?:react-aria(?:-components)?|react-stately|@react-aria\/|@react-stately\/)/.test(module)
    ) {
      failures.push(`React Aria runtime outside its specialized boundary: ${relative}`);
    }
    if (/^(?:tailwind-variants|tailwindcss)/.test(module)) {
      failures.push(`Tailwind runtime in reconstructed source: ${relative}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `${families.length} source families have React/style entries; package and interaction boundaries verified.`,
  );
  console.log("This is structural evidence, not behavioral or visual parity certification.");
}
