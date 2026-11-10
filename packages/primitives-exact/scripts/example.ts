import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import library from "../package.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");

export async function stagePackage(app: string) {
  const installed = path.join(app, "node_modules", library.name);
  await mkdir(installed, { recursive: true });
  for (const name of ["package.json", ...library.files]) {
    await cp(path.join(root, name), path.join(installed, name), {
      recursive: true,
      async filter(source, destination) {
        if ((await stat(source)).isDirectory()) return true;
        const target = Bun.file(destination);
        return (
          !(await target.exists()) || (await Bun.file(source).text()) !== (await target.text())
        );
      },
    });
  }
}

export async function buildExample() {
  const exact = process.env["EXACT_ROOT"];
  if (!exact) throw new Error("Set EXACT_ROOT to an initialized expo/exact checkout");
  const cache = path.join(root, ".cache/example");
  const app = path.join(cache, "app");
  const dist = path.join(cache, "dist");
  await rm(cache, { recursive: true, force: true });
  await cp(path.join(root, "example"), app, { recursive: true });
  await stagePackage(app);
  const child = Bun.spawn(
    ["bun", path.resolve(exact, "host/web/build.mjs"), "app-web", "--render", "none"],
    {
      cwd: exact,
      env: { ...process.env, EXACT_APP_DIR: app, EXACT_WEB_DIST: dist, EXACT_FEEDBACK: "0" },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await child.exited) !== 0) throw new Error("Exact primitive consumer build failed");
  return { app, dist, exact: path.resolve(exact) };
}

if (import.meta.main) console.log(await buildExample());
