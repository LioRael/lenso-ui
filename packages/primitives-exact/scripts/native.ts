import { mkdir } from "node:fs/promises";
import path from "node:path";
import { stagePackage } from "./example";

const root = path.resolve(import.meta.dirname, "..");
const exactRoot = process.env["EXACT_ROOT"];
if (!exactRoot) throw new Error("Set EXACT_ROOT to an initialized expo/exact checkout");
const exact = path.resolve(exactRoot);
const app = path.join(root, ".cache/native/primitives-fixture");
const host = process.argv[2];
if (host !== "macos" && host !== "ios" && host !== "linux")
  throw new Error("Choose macos, ios, or linux");
const env = { ...process.env, EXACT2: exact, EXACT_FEEDBACK: "0" };

async function run(args: string[], cwd = app) {
  const child = Bun.spawn(["bun", ...args], { cwd, env, stdout: "inherit", stderr: "inherit" });
  const status = await child.exited;
  if (status !== 0) throw new Error(`Exact ${host} command failed (${status}): ${args.join(" ")}`);
}

await mkdir(path.dirname(app), { recursive: true });
if (!(await Bun.file(path.join(app, "exact.mjs")).exists())) {
  await run(
    [
      path.join(exact, "scripts/exact.mjs"),
      "new",
      app,
      "--name",
      "Exact primitives",
      "--bundle-id",
      "dev.lenso.primitives",
      "--with",
      "macos,ios,linux",
    ],
    exact,
  );
}
// Preserve the generated native workspace and its build cache between checks.
for (const name of ["app.contract", "app.test.contract", "app.json", "app.ts"]) {
  const source = await Bun.file(path.join(root, "example", name)).text();
  const file = Bun.file(path.join(app, name));
  if (!(await file.exists()) || (await file.text()) !== source) await Bun.write(file, source);
}
await stagePackage(app);
const cli = path.join(app, "exact.mjs");
await run([cli, host === "macos" ? "mac" : host]);
if (!process.argv.includes("--build-only")) {
  await run([cli, "test", host, "app.test.contract"]);
  await run([path.join(root, "test/accessibility.mjs"), host, app]);
}
console.log(`${host}: ${app}`);
