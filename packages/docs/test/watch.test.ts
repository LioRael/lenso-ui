import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "bun:test";
import { setTimeout as delay } from "node:timers/promises";
import { loadHost, type SourceWatchCallbacks } from "../src/host.ts";
import { sourceWatchLifecycle, watchInputs } from "../src/runtime.ts";

const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-watch-"));
  cleanup.push(() => rm(root, { recursive: true, force: true }));
  const write = async (relative: string, text: string) => {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  };
  return { root, write };
}

async function eventually(predicate: () => boolean) {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, "watch callback did not converge");
    await delay(20);
  }
}

// Contained site input tests cannot prove source-owned sibling API inputs update
// the same owner and unsubscribe when the source is replaced or dev exits.
test("source-owned external inputs refresh through one disposable subscription", async () => {
  const { root, write } = await fixture();
  await write("inputs/api.ts", "initial");
  await write(
    "site/docs.source.mjs",
    `
import { watchInputs } from ${JSON.stringify(new URL("../src/runtime.ts", import.meta.url).href)};
export function watchSource({ root, config, onChange, onError }) {
  if (config.title !== "Docs") throw new Error("missing config context");
  return watchInputs(root + "/..", ["inputs"], () => onChange(["component-api-change"]), onError);
}
export function loadSource() {
  return { pages: [{ id: "index", slug: "", locale: "en", url: "/", title: "Home", markdown: "# Home" }] };
}
`,
  );
  const config = {
    title: "Docs",
    basePath: "",
    contentDir: "content",
    language: "en",
    source: "docs.source.mjs",
  };
  const site = path.join(root, "site");
  assert.equal((await loadHost(site, config, "build")).watchSource, undefined);
  const host = await loadHost(site, config, "dev");
  const watchSource = host.watchSource;
  assert.ok(watchSource);
  const events: string[][] = [];
  const errors: unknown[] = [];
  let subscriptions = 0;
  let disposals = 0;
  const lifecycle = sourceWatchLifecycle(
    (paths) => {
      events.push(paths);
    },
    (error) => errors.push(error),
  );
  cleanup.push(() => lifecycle.close());
  const subscribe = async (callbacks: SourceWatchCallbacks) => {
    subscriptions++;
    const close = await watchSource(callbacks);
    return () => {
      disposals++;
      close();
    };
  };
  await lifecycle.update("source-a", subscribe);
  await lifecycle.update("source-a", subscribe);
  assert.equal(subscriptions, 1, "body refreshes must retain the external input snapshot");
  await write("inputs/api.ts", "updated");
  await eventually(() => events.length === 1);
  assert.deepEqual(events[0], ["component-api-change"]);
  await lifecycle.update("source-b", subscribe);
  assert.equal(subscriptions, 2);
  assert.equal(disposals, 1);
  await write("inputs/api.ts", "next source");
  await eventually(() => events.length === 2);
  await lifecycle.close();
  assert.equal(disposals, 2);
  await write("inputs/api.ts", "after dev exit");
  await delay(350);
  assert.equal(events.length, 2);
  assert.deepEqual(errors, []);
});

// Runtime preparation tests do not observe fs.watch recovery or edits during a hook.
test("an edit while watcher subscriptions are replaced is not lost", async () => {
  const { root, write } = await fixture();
  const canonicalRoot = await realpath(root);
  await write("routes/home.tsx", "initial");
  const original = fs.promises.lstat;
  const originalWatch = fs.watch;
  let armed = false;
  let dropEvents = false;
  let inspections = 0;
  let latest: string | undefined;
  fs.watch = ((
    file: fs.PathLike,
    options: fs.WatchOptionsWithStringEncoding,
    listener: fs.WatchListener<string>,
  ) =>
    originalWatch(file, options, (event, name) => {
      // macOS may replay events to a new subscription. Model systems where
      // changes made without a subscription have no later notification.
      if (!dropEvents) listener(event, name);
    })) as typeof fs.watch;
  fs.promises.lstat = (async (file: fs.PathLike) => {
    // Write after the post-generation snapshot, while subscriptions are replaced.
    if (armed && String(file) === path.join(canonicalRoot, "routes") && ++inspections === 2) {
      armed = false;
      dropEvents = true;
      await write("routes/home.tsx", "edit during subscription replacement");
    }
    return original(file);
  }) as typeof fs.promises.lstat;
  syncBuiltinESMExports();
  cleanup.push(() => {
    fs.promises.lstat = original;
    fs.watch = originalWatch;
    syncBuiltinESMExports();
  });
  const close = await watchInputs(root, ["routes/home.tsx"], async () => {
    latest = await readFile(path.join(root, "routes/home.tsx"), "utf8");
    if (latest === "first edit") armed = true;
  });
  cleanup.push(close);
  await write("routes/home.tsx", "first edit");
  await eventually(() => latest === "edit during subscription replacement");
});

test("a failed prepare keeps nested file and missing ancestor recovery live", async () => {
  const { root, write } = await fixture();
  await write("routes/nested/home.tsx", "first");
  let calls = 0;
  let latest: string | undefined;
  const errors: unknown[] = [];
  const close = await watchInputs(
    root,
    ["routes/nested/home.tsx"],
    async () => {
      calls++;
      latest = await readFile(path.join(root, "routes/nested/home.tsx"), "utf8");
    },
    (error) => errors.push(error),
  );
  cleanup.push(close);

  await rm(path.join(root, "routes/nested/home.tsx"));
  await eventually(() => errors.length === 1);
  await delay(400);
  assert.equal(calls, 1, "a missing input must not busy-loop");
  await write("routes/nested/home.tsx", "recreated");
  await eventually(() => latest === "recreated");
  assert.equal(calls, 2);

  await rm(path.join(root, "routes"), { recursive: true });
  await eventually(() => errors.length === 2);
  await delay(200);
  await write("routes/nested/home.tsx", "new parent");
  await eventually(() => latest === "new parent");
  await delay(400);
  assert.equal(calls, 4);
});

test("precise input watches ignore unrelated siblings and byte-identical writes", async () => {
  const { root, write } = await fixture();
  await write("src/routes/home.tsx", "first");
  await write("src/demos/nested/demo.tsx", "demo");
  let calls = 0;
  const errors: unknown[] = [];
  const close = await watchInputs(
    root,
    ["src/routes/home.tsx", "src/demos"],
    async () => {
      calls++;
    },
    (error) => errors.push(error),
  );
  cleanup.push(close);
  await write("src/unrelated.tsx", "not declared");
  await write("src/routes/sibling.tsx", "not declared");
  await write(".lenso/generated.tsx", "owned");
  await write("out/index.html", "owned");
  await write("src/routes/home.tsx", "first");
  await delay(500);
  assert.equal(calls, 0);
  await write("src/demos/nested/demo.tsx", "updated demo");
  await eventually(() => calls === 1);
  await delay(300);
  await write("src/routes/home.tsx", "updated route");
  await eventually(() => calls === 2);
  assert.deepEqual(errors, []);
});

test("an edit during async preparation gets one catch-up without a rewrite loop", async () => {
  const { root, write } = await fixture();
  await write("content/home.md", "initial");
  await write("src/generated/model.json", "same output");
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  let latest: string | undefined;
  const errors: unknown[] = [];
  const close = await watchInputs(
    root,
    ["content", "src/generated"],
    async () => {
      calls++;
      const input = await readFile(path.join(root, "content/home.md"), "utf8");
      if (calls === 1) await blocked;
      // Hooks often overwrite outputs even when bytes do not change.
      await write("src/generated/model.json", "same output");
      latest = input;
    },
    (error) => errors.push(error),
  );
  cleanup.push(close);
  cleanup.push(release);
  await write("content/home.md", "first edit");
  await eventually(() => calls === 1);
  await write("content/home.md", "concurrent edit");
  release();
  await eventually(() => latest === "concurrent edit");
  await delay(600);
  assert.equal(calls, 2);
  assert.deepEqual(errors, []);
  await write("content/home.md", "later edit");
  await eventually(() => latest === "later edit");
  await delay(400);
  assert.equal(calls, 3, "mtime-only output rewrites must not add a catch-up");
});

test("even nonconvergent hook outputs have at most one follow-up per input edit", async () => {
  const { root, write } = await fixture();
  await write("content/home.md", "initial");
  await write("generated/model.json", "initial");
  let calls = 0;
  const close = await watchInputs(root, ["content", "generated"], async () => {
    await write("generated/model.json", String(++calls));
  });
  cleanup.push(close);
  await write("content/home.md", "edit");
  await eventually(() => calls === 2);
  await delay(600);
  assert.equal(calls, 2);
  close();
  await write("content/home.md", "after cleanup");
  await delay(300);
  assert.equal(calls, 2);
});
