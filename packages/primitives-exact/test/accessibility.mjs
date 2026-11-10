import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [host, app] = process.argv.slice(2);
const exactRoot = process.env.EXACT_ROOT;
if (!exactRoot || !app || !["macos", "ios", "linux"].includes(host))
  throw new Error("Use EXACT_ROOT=<checkout> bun test/accessibility.mjs <macos|ios|linux> <app>");
const exact = path.resolve(exactRoot);
process.env.EXACT_APP_DIR = path.resolve(app);
const { open } = await import(pathToFileURL(path.join(exact, "scripts/agent.mjs")).href);
const { axClean } = await import(pathToFileURL(path.join(exact, "scripts/agent-ax.mjs")).href);
const evidence = path.resolve(import.meta.dirname, "../.cache/native/evidence");
await mkdir(evidence, { recursive: true });
const receipt = path.join(evidence, `${host}-accessibility.json`);
await rm(receipt, { force: true });
const snapshots = [];
const session = await open({
  host,
  chrome: host === "linux" ? "agent" : "platform",
  env: { ...process.env, EXACT_APP_DIR: path.resolve(app), EXACT_FEEDBACK: "0" },
  storage: `primitive-ax-${process.pid}`,
});

async function observe(label) {
  const reply = await session.tree(undefined, { ax: true, limit: 2000 });
  snapshots.push({ label, reply });
  await Bun.write(
    path.join(evidence, `${host}-observations.json`),
    JSON.stringify(snapshots, null, 2),
  );
  return reply;
}

function element(reply, id, role, name) {
  const hit = reply.ax.elements.find((e) => e.testId === id && ["self", "owner"].includes(e.via));
  assert.ok(hit, `${host}: ${id} is exposed by the native accessibility API`);
  if (role) assert.equal(hit.role, role, `${id} role`);
  if (name) assert.equal(hit.name, name, `${id} accessible name`);
  return hit;
}

function clean(reply) {
  assert.equal(axClean(reply), true, `${host}: complete native AX observation`);
  assert.deepEqual(reply.ax.findings, [], `${host}: unnamed, hidden or outside-modal exposure`);
}

try {
  let reply = await observe("initial");
  if (host === "linux" && reply.ax?.unavailable) {
    console.log(
      `linux: native AX unavailable: ${reply.ax.reason}; semantic intent is not AT-SPI acceptance`,
    );
  } else {
    clean(reply);
    element(reply, "increment", "button", "Increment");
    element(reply, "name", "textbox", "Name");
    assert.match(element(reply, "name").description ?? "", /Use your full name/);
    element(reply, "subscribe", "checkbox", "Subscribe");
    element(reply, "notifications", "switch", "Notifications");
    element(reply, "volume", "slider", "Volume");
    element(reply, "details-trigger", "button", "Details");
    if (host === "macos") {
      element(reply, "tabs", "tablist", "Account");
      assert.equal(element(reply, "profile-tab", "tab", "Profile tab").states?.selected, true);
    }
    assert.equal(
      reply.ax.elements.some((e) => e.testId === "details-action"),
      false,
    );

    await session.type("subscribe", "true");
    reply = await observe("checked");
    clean(reply);
    const checked = element(reply, "subscribe");
    assert.equal(checked.states?.checked === true || checked.value === "1", true);
    await session.tap("pin");
    reply = await observe("pressed");
    const pinned = element(reply, "pin");
    assert.equal(
      reply.ax.source === "uikit"
        ? pinned.native?.role?.includes("toggleButton") && pinned.value === "1"
        : pinned.states?.pressed,
      true,
    );

    await session.tap("disable");
    reply = await observe("disabled");
    clean(reply);
    assert.equal(element(reply, "increment").states?.disabled, true);
    assert.equal(element(reply, "name").states?.disabled, true);
    await session.tap("disable");
    await session.tap("details-trigger");
    reply = await observe("expanded");
    clean(reply);
    element(reply, "details-action", "button", "Details action");
    assert.equal(element(reply, "details-trigger").states?.expanded, true);

    await session.tap("open-dialog");
    await session.clock("settle");
    reply = await observe("modal");
    clean(reply);
    assert.equal(reply.ax.modal?.present, true, "host exposes the active modal scope");
    element(reply, "close-dialog", "button", "Close");
    await session.tap("close-dialog");
    await session.clock("settle");
    reply = await observe("closed");
    clean(reply);
    assert.equal(reply.ax.modal?.present, false);
    console.log(
      `${host}: native accessibility names, roles, states, hidden content and modality passed`,
    );
    await Bun.write(
      receipt,
      JSON.stringify({ host, status: "passed", snapshots: snapshots.map((s) => s.label) }, null, 2),
    );
  }
} finally {
  await session.close();
}
