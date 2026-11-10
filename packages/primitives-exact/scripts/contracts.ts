import assert from "node:assert/strict";
import path from "node:path";
import { stagePackage } from "./example";

const exactRoot = process.env["EXACT_ROOT"];
if (!exactRoot) throw new Error("Set EXACT_ROOT to an initialized expo/exact checkout");
const compiler =
  process.env["EXACT_CONTRACT_BIN"] ?? path.resolve(exactRoot, "target/debug/contract");
const app = path.resolve(import.meta.dirname, "../.cache/contracts");
await stagePackage(app);

// Dynamic cases and the remaining invocation conflict are not static acceptance proofs.
const cases = [
  {
    name: "typed-tooltip-composition",
    source: (await Bun.file(path.resolve(import.meta.dirname, "../TOOLTIP.md")).text()).match(
      /```contract\n([\s\S]*?)```/,
    )![1]!,
    result: "accepted",
  },
  {
    name: "invalid-tabs-orientation",
    diagnostic: "type-prop",
    source: `use TabsList from "@lenso/primitives-exact"
component App
  view
    TabsList(id="tabs", label="Tabs", orientation="diagonal")
      text "Invalid"
`,
    result: "rejected",
  },
  {
    name: "text-input-supported-modes",
    source: `use Input from "@lenso/primitives-exact"
component App
  state draft = ""
  state secret = false
  state submitted = false
  action edit(value: string)
    draft = value
  action submit
    submitted = true
  view
    column
${["text", "search", "email", "url", "tel", "password"].map((kind) => `      Input(id="${kind}", label="${kind}", description="", value="", type="${kind}", placeholder="", disabled=false, readOnly=false, invalid=false, input=edit, change=edit, submit=submit)`).join("\n")}
      Input(id="dynamic", label="Dynamic", description="", value="", type=(secret ? "password" : "text"), placeholder="", disabled=false, readOnly=false, invalid=false, input=edit, change=edit, submit=submit)
`,
    result: "accepted",
  },
  {
    name: "text-input-rejects-checkbox",
    source: `use Input from "@lenso/primitives-exact"
component App
  state draft = ""
  state submitted = false
  action edit(value: string)
    draft = value
  action submit
    submitted = true
  view
    Input(id="name", label="Name", description="", value="", type="checkbox", placeholder="", disabled=false, readOnly=false, invalid=false, input=edit, change=edit, submit=submit)
`,
    result: "rejected",
    diagnostic: "type-prop",
  },
  {
    name: "close-controls-subpath-api",
    source: `use Dialog, DialogClose from "@lenso/primitives-exact/dialog"
use Popover, PopoverClose from "@lenso/primitives-exact/popover"
component App
  view
    column
      Dialog(id="dialog", label="Settings", description="")
        DialogClose(id="close", label="Close", target="dialog", disabled=true)
          text "Close"
      Popover(id="info", label="Information")
        PopoverClose(id="hide", label="Hide", target="info", disabled=true)
          text "Hide"
`,
    result: "accepted",
  },
  {
    name: "root-hides-tooltip-intent",
    source: `use TooltipIntent from "@lenso/primitives-exact"
component App
  view
    text "Unsupported helper"
`,
    result: "rejected",
    diagnostic: "contract-use-unknown",
  },
  {
    name: "child-timer",
    source: `component App
  view
    Child()
component Child
  task delayed mount
    after(500, ready)
  action ready
    showPopover("tip")
  view
    text "Help"
`,
    result: "rejected",
    diagnostic: "type-child-resource",
  },
  {
    name: "computed-timer",
    source: `component App
  state delay = 500
  task delayed mount
    after(delay, ready)
  action ready
    showPopover("tip")
  view
    column id="tip" popover="manual"
      text "Help"
`,
    result: "rejected",
    diagnostic: "lower-timer-literal",
  },
  {
    name: "unnamed-dialog",
    diagnostic: "analyze-dialog-name",
    source: `component App
  view
    dialog id="dialog"
      text "Content"
`,
    result: "rejected",
  },
  {
    name: "missing-command-target",
    diagnostic: "analyze-command-target",
    source: `component App
  view
    button commandfor="missing" command="show-modal"
      text "Open"
`,
    result: "rejected",
  },
  {
    name: "missing-tooltip-description-target",
    diagnostic: "analyze-aria-reference",
    source: `component App
  view
    button aria-describedby="missing"
      text "Help"
`,
    result: "rejected",
  },
  {
    name: "expanded-valid-dialog-and-aria-list",
    source: `use Dialog, DialogTrigger, FieldDescription from "@lenso/primitives-exact"
component App
  view
    column
      DialogTrigger(id="open", label="Settings", target="settings", disabled=false)
        text "Settings"
      Dialog(id="settings", label="Settings", description="first second")
        FieldDescription(id="first", message="One")
        FieldDescription(id="second", message="Two")
      button aria-controls="settings" aria-labelledby="title"
        text "Open"
      text "Settings" id="title"
`,
    result: "accepted",
  },
  {
    name: "named-dialog-by-slot-heading",
    source: `component App
  view
    Surface(id="settings", title="heading")
      text "Settings" id="heading"
component Surface
  props
    id: string
    title: string
  slot
  view
    dialog id=id aria-labelledby=title
      children
`,
    result: "accepted",
  },
  {
    name: "empty-imported-dialog-label",
    diagnosticSource: true,
    source: `use Dialog from "@lenso/primitives-exact"
component App
  view
    Dialog(id="settings", label="  ", description="")
      text "Body"
`,
    result: "rejected",
    diagnostic: "analyze-dialog-name",
  },
  {
    name: "empty-dialog-heading",
    source: `component App
  view
    dialog aria-labelledby="heading"
      text " " id="heading"
`,
    result: "rejected",
    diagnostic: "analyze-dialog-name",
  },
  ...["aria-labelledby", "aria-describedby", "aria-controls"].map((attribute) => ({
    name: `missing-${attribute}-list-member`,
    source: `component App
  view
    column
      button ${attribute}="title absent"
        text "Open"
      text "Title" id="title"
`,
    result: "rejected",
    diagnostic: "analyze-aria-reference",
  })),
  {
    name: "wrong-modal-command-target-kind",
    source: `component App
  view
    column
      button commandfor="target" command="show-modal"
        text "Open"
      column id="target"
`,
    result: "rejected",
    diagnostic: "analyze-command-kind",
  },
  {
    name: "wrong-popover-target-kind",
    source: `component App
  view
    column
      button popovertarget="target"
        text "Open"
      column id="target"
`,
    result: "rejected",
    diagnostic: "analyze-command-kind",
  },
  {
    name: "host-action-missing-target",
    source: `component App
  action open
    showModal("absent")
  view
    button press=open
      text "Open"
`,
    result: "rejected",
    diagnostic: "analyze-command-target",
  },
  {
    name: "host-action-valid-target",
    source: `component App
  action open
    showModal("settings")
  view
    column
      button press=open
        text "Open"
      dialog id="settings" aria-label="Settings"
`,
    result: "accepted",
  },
  {
    name: "disjoint-branch-target",
    source: `component App
  state show = true
  view
    if show
      button commandfor="settings" command="show-modal"
        text "Open"
    else
      dialog id="settings" aria-label="Settings"
`,
    result: "rejected",
    diagnostic: "analyze-command-target",
  },
  {
    name: "dynamic-name-target-and-conditional-lifetime",
    source: `component App
  state show = true
  state target = "settings"
  state label = "Settings"
  view
    column
      button commandfor=target command="show-modal"
        text "Open"
      if show
        dialog id="settings" aria-label=label
`,
    result: "runtime-obligation",
  },
  {
    name: "two-invocations-on-one-button",
    source: `component App
  view
    column
      button popovertarget="menu" commandfor="dialog" command="show-modal"
        text "Open"
      dialog id="dialog" aria-label="Settings"
        text "Settings"
      column id="menu" popover="auto" role="menu" aria-label="Actions"
        button
          text "Action"
`,
    result: "accepted-gap",
  },
];
const results: { name: string; expected: string; status: number; diagnostics: string }[] = [];
for (const probe of cases) {
  const file = path.join(app, `${probe.name}.contract`);
  await Bun.write(file, probe.source);
  const child = Bun.spawn([compiler, "build", file, "--errors-only", "-o", `${file}.plan`], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, status] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  const diagnostics = stdout + stderr;
  results.push({ name: probe.name, expected: probe.result, status, diagnostics });
  const verdict =
    status !== 0
      ? "rejected"
      : ["accepted-gap", "runtime-obligation"].includes(probe.result)
        ? probe.result
        : "accepted";
  console.log(`${probe.name}: ${verdict}`);
}
await Bun.write(path.join(app, "results.json"), JSON.stringify(results, null, 2));
for (const [index, probe] of cases.entries()) {
  const result = results[index]!;
  assert.equal(result.status === 0, probe.result !== "rejected", result.diagnostics || probe.name);
  if (probe.diagnostic)
    assert.ok(result.diagnostics.includes(probe.diagnostic), result.diagnostics);
  if ("diagnosticSource" in probe && probe.diagnosticSource)
    assert.ok(result.diagnostics.includes(`${probe.name}.contract:4:`), result.diagnostics);
}
