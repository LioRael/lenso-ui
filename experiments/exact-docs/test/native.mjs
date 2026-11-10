import path from "node:path";
import { buildNative } from "../src/index.ts";

const platform = process.env.NATIVE_PLATFORM ?? "macos";
if (platform !== "macos" && platform !== "ios") throw Error("NATIVE_PLATFORM must be macos or ios");
const exactRoot = process.env.EXACT_ROOT;
if (!exactRoot) throw Error("Set EXACT_ROOT to an initialized Exact checkout");
const { app, out, target } = await buildNative(path.resolve(import.meta.dirname, "../example"), {
  platform,
});
const child = Bun.spawn(
  [
    process.execPath,
    path.resolve(exactRoot, "scripts/agent.mjs"),
    platform,
    "--app",
    app,
    "--test",
    path.join(import.meta.dirname, "native.test.contract"),
    ...(platform === "ios" && process.env.EXACT_SIM ? ["--sim", process.env.EXACT_SIM] : []),
  ],
  {
    cwd: exactRoot,
    env: { ...process.env, CARGO_TARGET_DIR: target, EXACT_APP_DIR: app, EXACT_FEEDBACK: "0" },
    stdout: "inherit",
    stderr: "inherit",
  },
);
if ((await child.exited) !== 0) throw Error(`${platform} native documentation regression failed`);
console.log(`${platform}: native documentation checks passed; bundle ${out}`);
