import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import library from "../package.json" with { type: "json" };
import { linkWebStyles } from "./stage.js";

const root = path.resolve(import.meta.dirname, "..");

/** Build a consumer from the package's distributable files, not workspace aliases. */
export async function buildExample() {
  const exact = process.env["EXACT_ROOT"];
  if (!exact) throw new Error("Set EXACT_ROOT to an initialized Exact checkout");
  const cache = path.join(root, ".cache/example");
  const app = path.join(cache, "app");
  const dist = path.join(cache, "dist");
  await rm(cache, { recursive: true, force: true });
  await cp(path.join(root, "example"), app, { recursive: true });
  const installed = path.join(app, "node_modules/@lenso/ui-exact");
  await mkdir(installed, { recursive: true });
  for (const name of ["package.json", ...library.files]) {
    await mkdir(path.dirname(path.join(installed, name)), { recursive: true });
    await cp(path.join(root, name), path.join(installed, name), { recursive: true });
  }
  const prepare = Bun.spawn(
    [
      "bun",
      "-e",
      `
      import { stageWeb, withLensoWeb } from "@lenso/ui-exact/stage";
      const file = Bun.file("app.json");
      await Bun.write(file, JSON.stringify(withLensoWeb(await file.json()), null, 2) + "\\n");
      await stageWeb(process.cwd());
    `,
    ],
    { cwd: app, stdout: "inherit", stderr: "inherit" },
  );
  if ((await prepare.exited) !== 0) throw new Error("Exact consumer staging failed");
  const child = Bun.spawn(
    ["bun", path.resolve(exact, "host/web-js/build.mjs"), app, "--out", dist, "--render", "none"],
    {
      cwd: exact,
      env: { ...process.env, EXACT_FEEDBACK: "0" },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await child.exited) !== 0) throw new Error("Exact consumer build failed");
  await linkWebStyles(dist);
  return dist;
}

if (import.meta.main) console.log(await buildExample());
