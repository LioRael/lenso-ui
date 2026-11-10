import path from "node:path";
import { buildExample } from "./example";

const host = process.argv[2] ?? "web";
if (host !== "web")
  throw new Error(
    "This harness builds Web; native hosts need an initialized native app (see README)",
  );
const { app, dist, exact } = await buildExample();
const child = Bun.spawn(
  [
    "bun",
    path.join(exact, "scripts/agent.mjs"),
    host,
    "--test",
    path.join(app, "app.test.contract"),
  ],
  {
    cwd: exact,
    env: { ...process.env, EXACT_APP_DIR: app, EXACT_WEB_DIST: dist, EXACT_FEEDBACK: "0" },
    stdout: "inherit",
    stderr: "inherit",
  },
);
process.exitCode = await child.exited;
