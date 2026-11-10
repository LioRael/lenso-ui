import path from "node:path";
import { pathToFileURL } from "node:url";
import { generateApp, loadSite } from "./index.ts";
import { highlightDocuments } from "./highlight.ts";

export async function buildNative(
  directory: string,
  options: { platform: "macos" | "ios"; exactRoot?: string; run?: boolean; sim?: string },
) {
  const exactRoot = options.exactRoot ?? process.env["EXACT_ROOT"];
  if (!exactRoot) throw new Error("Set EXACT_ROOT to an initialized expo/exact checkout");
  if (process.platform !== "darwin") throw new Error("Apple builds require macOS and Xcode");
  if (options.sim && options.platform !== "ios") throw new Error("--sim requires --platform ios");
  const builder = path.resolve(exactRoot, "host/apple/build.mjs");
  if (!(await Bun.file(builder).exists()))
    throw new Error(`Exact Apple builder not found: ${builder}`);
  const site = await loadSite(directory);
  await highlightDocuments(site.documents);
  const app = await generateApp(site, options.platform);
  const target = process.env["CARGO_TARGET_DIR"]
    ? path.resolve(process.env["CARGO_TARGET_DIR"])
    : path.join(site.root, ".exact-docs/native-target");
  const env = { ...process.env, CARGO_TARGET_DIR: target, EXACT_APP_DIR: app, EXACT_FEEDBACK: "0" };
  const applicationModule = JSON.stringify(
    pathToFileURL(path.resolve(exactRoot, "scripts/app.mjs")).href,
  );
  // Generated Rust inputs must exist before the Apple receipt starts tracking edits.
  const prepare = Bun.spawn(
    [process.execPath, "-e", `import {resolveApp} from ${applicationModule}; resolveApp().rust();`],
    {
      cwd: exactRoot,
      env,
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await prepare.exited) !== 0) throw new Error("Could not prepare the Exact native workspace");
  const child = Bun.spawn(
    [
      process.execPath,
      builder,
      ...(options.platform === "ios"
        ? ["--ios", ...(options.run ? ["--run"] : ["--no-install"])]
        : ["--bundle", ...(options.run ? ["--run"] : [])]),
      ...(options.sim ? ["--sim", options.sim] : []),
    ],
    { cwd: exactRoot, env, stdout: "inherit", stderr: "inherit" },
  );
  if ((await child.exited) !== 0)
    throw new Error(`Exact ${options.platform} build failed; see compiler diagnostics above`);
  const inspect = Bun.spawn(
    [
      process.execPath,
      "-e",
      `import {appleArtifacts} from ${JSON.stringify(pathToFileURL(builder).href)}; import {resolveApp} from ${applicationModule}; console.log(JSON.stringify(appleArtifacts(resolveApp(), {destination:${JSON.stringify(options.platform === "ios" ? "ios-simulator" : "macos")}}).bundle));`,
    ],
    { cwd: exactRoot, env, stdout: "pipe", stderr: "inherit" },
  );
  const text = await new Response(inspect.stdout).text();
  if ((await inspect.exited) !== 0)
    throw new Error("Could not locate the native application bundle");
  const out: unknown = JSON.parse(text);
  if (typeof out !== "string") throw new Error("Exact returned an invalid application bundle path");
  return { site, app, out, target, platform: options.platform };
}
