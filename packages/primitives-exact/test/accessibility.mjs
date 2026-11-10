import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [host, app] = process.argv.slice(2);
const axScope = process.env.EXACT_AX_SCOPE ?? "lifecycle";
assert.ok(
  ["base", "nested", "lifecycle"].includes(axScope),
  "Choose base, nested or lifecycle AX scope",
);
const evidenceHost = axScope === "lifecycle" ? host : `${host}-${axScope}`;
const exactRoot = process.env.EXACT_ROOT;
if (!exactRoot || !app || !["web", "macos", "ios", "linux"].includes(host))
  throw new Error(
    "Use EXACT_ROOT=<checkout> bun test/accessibility.mjs <web|macos|ios|linux> <app>",
  );
const exact = path.resolve(exactRoot);
process.env.EXACT_APP_DIR = path.resolve(app);
const { open } = await import(pathToFileURL(path.join(exact, "scripts/agent.mjs")).href);
const { axClean, axFindings } = await import(
  pathToFileURL(path.join(exact, "scripts/agent-ax.mjs")).href
);
const evidence = path.resolve(import.meta.dirname, "../.cache/native/evidence");
await mkdir(evidence, { recursive: true });
const receipt = path.join(evidence, `${evidenceHost}-accessibility.json`);
await rm(receipt, { force: true });
const snapshots = [];
const options = {
  host,
  chrome: ["linux", "web"].includes(host) ? "agent" : "platform",
  env: { ...process.env, EXACT_APP_DIR: path.resolve(app), EXACT_FEEDBACK: "0" },
  storage: `primitive-ax-${process.pid}`,
};
let session = await open(options);

async function observe(label) {
  const reply = await session.tree(undefined, { ax: true, limit: 2000 });
  snapshots.push({ label, reply });
  await Bun.write(
    path.join(evidence, `${evidenceHost}-observations.json`),
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
    await Bun.write(
      receipt,
      JSON.stringify({ host, status: "unavailable", reason: reply.ax.reason }, null, 2),
    );
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
    element(reply, "volume", host === "ios" ? "adjustable" : "slider", "Volume");
    element(reply, "details-trigger", "button", "Details");
    if (host === "macos") {
      element(reply, "tabs", "tablist", "Account");
      assert.equal(element(reply, "profile-tab", "tab", "Profile tab").states?.selected, true);
    }
    assert.equal(
      reply.ax.elements.some((e) => e.testId === "details-action"),
      false,
    );

    assert.match(element(reply, "help-trigger").description ?? "", /Increment without changing/);
    await session.type("help-trigger", { key: "ArrowDown" });
    reply = await observe("tooltip");
    clean(reply);
    assert.equal(reply.ax.modal?.present, false, "tooltip is nonmodal");
    assert.ok(
      reply.ax.elements.some(
        (e) => e.testId === "help-tip" || e.name === "Increment without changing your settings.",
      ),
    );
    if (host === "macos") assert.equal(element(reply, "help-trigger").states?.focused, true);
    await session.type("help-trigger", { key: "Escape" });
    reply = await observe("tooltip-dismissed");
    clean(reply);
    assert.equal(
      reply.ax.elements.some((e) => e.testId === "help-tip"),
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

    await session.type("open-dialog", { key: "Space" });
    await session.clock("settle");
    reply = await observe("modal");
    clean(reply);
    assert.equal(reply.ax.modal?.present, true, "host exposes the active modal scope");
    element(reply, "close-dialog", "button", "Close");
    if (axScope !== "base") {
      await session.type("open-nested", { key: "Space" });
      await session.clock("settle");
      reply = await observe("nested-modal");
      clean(reply);
      assert.equal(reply.ax.modal?.present, true);
      element(reply, "close-nested", "button", "Back to settings");
      if (host === "web") {
        const parent = Object.entries(reply.ax.intent).find(
          ([, facts]) => facts.testId === "edit-dialog",
        );
        assert.ok(parent?.[1].inert, "covered parent is inert in the DOM");
        const hidden = structuredClone(reply);
        hidden.ax.intent[parent[0]].ariaHidden = true;
        assert.ok(
          axFindings(hidden).some(
            (f) => f.kind === "exposed-hidden" && String(f.under) === parent[0],
          ),
          "modal escape must not bypass aria-hidden diagnostics",
        );
      }
      assert.equal(
        reply.ax.elements.some((e) => ["edit-dialog", "increment"].includes(e.testId)),
        false,
      );
      assert.equal(
        reply.ax.elements.some((e) => e.testId === "dialog-increment"),
        false,
      );
      await session.tap("close-nested");
      await session.clock("settle");
      reply = await observe("parent-modal");
      clean(reply);
      assert.equal(reply.ax.modal?.present, true);
      element(reply, "dialog-increment", "button", "Increment in dialog");
      assert.equal(
        reply.ax.elements.some((e) => e.testId === "close-nested"),
        false,
      );
      if (host === "macos") assert.equal(element(reply, "open-nested").states?.focused, true);
    }
    await session.tap("close-dialog");
    await session.clock("settle");
    reply = await observe("closed");
    clean(reply);
    assert.equal(reply.ax.modal?.present, false);
    if (host === "macos") assert.equal(element(reply, "open-dialog").states?.focused, true);
    if (axScope === "lifecycle") {
      async function fresh() {
        await session.close();
        session = await open(options);
      }
      async function openDepth(depth) {
        for (const id of ["open-dialog", "open-nested", "open-third", "open-fourth"].slice(
          0,
          depth,
        )) {
          await session.type(id, { key: "Space" });
          await session.clock("settle");
        }
      }
      async function scope(label, modal, shown, absent = []) {
        const reply = await observe(label);
        clean(reply);
        assert.equal(reply.ax.modal?.present, modal, label);
        for (const id of shown) element(reply, id);
        for (const id of absent)
          assert.equal(
            reply.ax.elements.some((e) => e.testId === id),
            false,
            `${label}: ${id} stays isolated`,
          );
      }
      async function focus(...ids) {
        const state = await session.state();
        snapshots.push({ label: `focus:${ids.join("|")}`, state });
        await Bun.write(
          path.join(evidence, `${evidenceHost}-observations.json`),
          JSON.stringify(snapshots, null, 2),
        );
        if (host !== "web") {
          const wanted = await Promise.all(ids.map(async (id) => (await session.find(id)).id));
          assert.ok(
            wanted.includes(state.focus.logical),
            `${host}: current focus ${state.focus.logical} must be ${ids.join(" or ")}`,
          );
        }
      }
      await fresh();
      await openDepth(4);
      await scope(
        "four-level-modal",
        true,
        ["close-fourth"],
        ["increment", "dialog-increment", "nested-fallback", "third-fallback"],
      );
      for (const [close, invoker, visible, hidden] of [
        ["close-fourth", "open-fourth", "third-fallback", "close-fourth"],
        ["close-third", "open-third", "nested-fallback", "third-fallback"],
        ["close-nested", "open-nested", "dialog-increment", "nested-fallback"],
        ["close-dialog", "open-dialog", "increment", "dialog-increment"],
      ]) {
        await session.type(close, { key: "Escape" });
        await session.clock("settle");
        await scope(`returned:${invoker}`, close !== "close-dialog", [visible], [hidden]);
        await focus(invoker);
      }
      await fresh();
      await openDepth(3);
      await session.tap("remove-third-trigger");
      await session.clock("settle");
      await scope(
        "removed-child-invoker",
        true,
        ["nested-fallback"],
        ["open-third", "third-fallback", "dialog-increment", "increment"],
      );
      await focus("nested-fallback", "nested-dialog");
      await fresh();
      await openDepth(1);
      await session.tap("remove-page-trigger");
      await session.clock("settle");
      await scope(
        "removed-page-invoker",
        false,
        ["increment"],
        ["open-dialog", "dialog-increment"],
      );
      await focus("page-fallback", "home-route");
      await fresh();
      await openDepth(4);
      await session.tap("remove-third-surface");
      await session.clock("settle");
      await scope(
        "removed-modal-subtree",
        true,
        ["nested-fallback"],
        ["third-fallback", "close-fourth", "dialog-increment", "increment"],
      );
      await focus("open-third");
      for (const action of ["navigate-push", "navigate-dispose"]) {
        await fresh();
        await openDepth(4);
        await session.tap(action);
        await session.clock("settle");
        await scope(
          action,
          false,
          ["next-focus", "return-home"],
          ["increment", "dialog-increment", "nested-fallback", "third-fallback", "close-fourth"],
        );
        await focus("next-focus");
        await session.clock("+500");
        await focus("next-focus");
        if (action === "navigate-push") {
          await session.tap("return-home");
          await session.clock("settle");
          await scope(
            "navigation-back",
            false,
            ["increment"],
            ["next-focus", "dialog-increment", "close-fourth"],
          );
          await focus("home-route", "page-fallback");
        }
      }
    }
    console.log(`${host}: ${axScope} accessibility regression passed`);
    await Bun.write(
      receipt,
      JSON.stringify(
        { host, scope: axScope, status: "passed", snapshots: snapshots.map((s) => s.label) },
        null,
        2,
      ),
    );
  }
} finally {
  await session.close();
}
