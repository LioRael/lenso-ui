import { watch } from "node:fs";
import path from "node:path";

const framework = path.resolve(import.meta.dirname, "..");
export const developmentPackages = path.resolve(framework, "../../packages");

export function ignoredDevelopmentPath(filename: string) {
  return filename
    .split(/[\\/]/)
    .some((part) => part.startsWith(".") || ["dist", "node_modules", "target"].includes(part));
}

/** Watch source inputs only: generated bridges and build outputs must not loop. */
export function watchThemeSources(
  changed: (kind: "theme" | "ui") => void,
  packages = developmentPackages,
  themes = path.join(framework, "themes"),
) {
  const watchers = [
    watch(themes, { recursive: true }, (_event, filename) => {
      if (filename && !ignoredDevelopmentPath(filename)) changed("theme");
    }),
  ];
  try {
    for (const name of ["ui-exact", "glass", "tokens", "primitives-exact"]) {
      watchers.push(
        watch(path.join(packages, name), { recursive: true }, (_event, filename) => {
          if (!filename || ignoredDevelopmentPath(filename)) return;
          const file = filename.replaceAll("\\", "/");
          if (file === "components/generated" || file.startsWith("components/generated/")) return;
          if (
            file.startsWith("src/") ||
            file.startsWith("components/") ||
            (name === "ui-exact" && file.startsWith("scripts/")) ||
            ["index.contract", "manifest.json", "package.json", "styles.css"].includes(file)
          )
            changed("ui");
        }),
      );
    }
  } catch (error) {
    for (const watcher of watchers) watcher.close();
    throw error;
  }
  return () => {
    for (const watcher of watchers) watcher.close();
  };
}

export async function buildDevelopmentUI(output: string) {
  const child = Bun.spawn(
    [
      process.execPath,
      path.join(developmentPackages, "ui-exact/scripts/build.ts"),
      "--browser-only",
      "--out",
      output,
    ],
    { stdout: "inherit", stderr: "pipe" },
  );
  const errors = await new Response(child.stderr).text();
  if ((await child.exited) !== 0) throw new Error(`Lenso UI build failed\n${errors}`);
  if (errors) console.error(errors.trimEnd());
}
