import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(root, "../..");
const artifact = resolve(process.env["STORYBOOK_STATIC"] ?? resolve(root, "storybook-static"));
const playwrightUrl = import.meta.resolve("playwright");
const playwright = fileURLToPath(playwrightUrl);
const scripts: Record<string, [string, string[]]> = {
  actions: ["stories/actions-smoke.fixtures.mjs", [artifact, playwright]],
  navigation: ["stories/navigation-smoke.ts", [artifact, playwright]],
  form: ["stories/form-workflow-proof.ts", [artifact, playwright]],
  calendar: ["stories/calendar-proof.mjs", [artifact, playwright]],
  date: ["stories/date-time-story-proof.mjs", [artifact, playwright]],
  "menu-toast": ["stories/menu-toast-proof.mjs", [artifact, playwright]],
  overlay: ["stories/overlay-proof.mjs", [artifact, playwright]],
  collection: [
    "stories/collection-proof.mjs",
    [artifact, playwright, resolve(workspace, "test-results/storybook/collection")],
  ],
  selection: ["stories/selection-proof.mjs", [artifact, workspace]],
  color: ["stories/color-proof.mjs", []],
  choice: ["stories/choice-proof.mjs", []],
  rtl: ["scripts/rtl-proof.ts", []],
  display: [
    "iframe-smoke.mjs",
    [
      artifact,
      playwright,
      "Alert,Avatar,AvatarGroup,Badge,Button,Card,Checkbox,Chip,Fieldset,Input,InputGroup,Kbd,Meter,ProgressBar,ProgressCircle,Skeleton,Separator,Spinner,Surface,Switch,TextField,Textarea,Typography,ScrollShadow",
      "--replay-source-assets",
    ],
  ],
};
const selected = process.argv.slice(2);
const suites = selected.length ? selected : Object.keys(scripts);
for (const name of suites)
  assert(scripts[name], `Unknown suite ${name}; choose ${Object.keys(scripts).join(", ")}`);
await readFile(resolve(artifact, "index.json")); // Fail before launching any browser if the shared build is missing.

const mime: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  const file = resolve(artifact, `.${path === "/" ? "/index.html" : decodeURIComponent(path)}`);
  if (!file.startsWith(artifact + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    response.setHeader("Content-Type", mime[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
assert(address && typeof address !== "string");
const env = {
  ...process.env,
  PLAYWRIGHT_MODULE: playwrightUrl,
  COLOR_STORYBOOK_STATIC: artifact,
  LENSO_CHOICE_URL: `http://127.0.0.1:${address.port}`,
};
try {
  for (const name of suites) {
    const [file, args] = scripts[name]!;
    console.log(`PROOF ${name}: ${artifact}`);
    await new Promise<void>((done, reject) => {
      // Native erasure avoids transpiler helpers in functions serialized by Playwright.
      const child = spawn(process.execPath, [resolve(root, file), ...args], {
        cwd: root,
        env,
        stdio: "inherit",
      });
      child.on("error", reject);
      child.on("exit", (code) =>
        code === 0 ? done() : reject(new Error(`${name} exited ${code}`)),
      );
    });
  }
} finally {
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done())),
  );
}
