import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { watchInputs } from "../src/runtime.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-watch-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (relative, text) => {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  };
  return { root, write };
}

async function eventually(predicate) {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, "watch callback did not converge");
    await delay(20);
  }
}

// Runtime preparation tests do not observe fs.watch recovery or edits during a hook.
test("an edit while watcher subscriptions are replaced is not lost", async (t) => {
  const { root, write } = await fixture(t);
  const canonicalRoot = await realpath(root);
  await write("routes/home.tsx", "initial");
  const original = fs.promises.lstat;
  const originalWatch = fs.watch;
  let armed = false;
  let dropEvents = false;
  let inspections = 0;
  let latest;
  fs.watch = (file, options, listener) =>
    originalWatch(file, options, (event, name) => {
      // macOS may replay events to a new subscription. Model systems where
      // changes made without a subscription have no later notification.
      if (!dropEvents) listener(event, name);
    });
  fs.promises.lstat = async (...args) => {
    // After generation, two snapshots precede subscription replacement.
    // Inject a real input write into that unobserved filesystem interval.
    if (armed && String(args[0]) === path.join(canonicalRoot, "routes") && ++inspections === 3) {
      armed = false;
      dropEvents = true;
      await write("routes/home.tsx", "edit during subscription replacement");
    }
    return original(...args);
  };
  syncBuiltinESMExports();
  t.after(() => {
    fs.promises.lstat = original;
    fs.watch = originalWatch;
    syncBuiltinESMExports();
  });
  const close = await watchInputs(root, ["routes/home.tsx"], async () => {
    latest = await readFile(path.join(root, "routes/home.tsx"), "utf8");
    if (latest === "first edit") armed = true;
  });
  t.after(close);
  await write("routes/home.tsx", "first edit");
  await eventually(() => latest === "edit during subscription replacement");
});

test("a failed prepare keeps nested file and missing ancestor recovery live", async (t) => {
  const { root, write } = await fixture(t);
  await write("routes/nested/home.tsx", "first");
  let calls = 0;
  let latest;
  const errors = [];
  const close = await watchInputs(
    root,
    ["routes/nested/home.tsx"],
    async () => {
      calls++;
      latest = await readFile(path.join(root, "routes/nested/home.tsx"), "utf8");
    },
    (error) => errors.push(error),
  );
  t.after(close);

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

test("precise input watches ignore unrelated siblings and byte-identical writes", async (t) => {
  const { root, write } = await fixture(t);
  await write("src/routes/home.tsx", "first");
  await write("src/demos/nested/demo.tsx", "demo");
  let calls = 0;
  const errors = [];
  const close = await watchInputs(
    root,
    ["src/routes/home.tsx", "src/demos"],
    async () => {
      calls++;
    },
    (error) => errors.push(error),
  );
  t.after(close);
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

test("an edit during async preparation gets one catch-up without a rewrite loop", async (t) => {
  const { root, write } = await fixture(t);
  await write("content/home.md", "initial");
  await write("src/generated/model.json", "same output");
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  let calls = 0;
  let latest;
  const errors = [];
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
  t.after(close);
  t.after(release);
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

test("even nonconvergent hook outputs have at most one follow-up per input edit", async (t) => {
  const { root, write } = await fixture(t);
  await write("content/home.md", "initial");
  await write("generated/model.json", "initial");
  let calls = 0;
  const close = await watchInputs(root, ["content", "generated"], async () => {
    await write("generated/model.json", String(++calls));
  });
  t.after(close);
  await write("content/home.md", "edit");
  await eventually(() => calls === 2);
  await delay(600);
  assert.equal(calls, 2);
  close();
  await write("content/home.md", "after cleanup");
  await delay(300);
  assert.equal(calls, 2);
});
