"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Popover } from "@lenso/ui/popover";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type Placement = "bottom" | "left" | "right" | "top";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Popover } from "@lenso/ui/popover"

<Popover.Root>
  <Popover.Trigger>Open popover</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner side="bottom">
      <Popover.Popup aria-label="Project actions">
        <Popover.Item>Edit issue</Popover.Item>
        <Popover.Item>Set reminder</Popover.Item>
        <Popover.Item tone="danger">Delete</Popover.Item>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>`;

export function PopoverDocumentation() {
  const [arrow, setArrow] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [placement, setPlacement] = React.useState<Placement>("bottom");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Popover"]}
      current="popover"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · OVERLAYS</p>
          <h1>Popover</h1>
          <p className="button-description">
            Anchored non-modal surface for focused contextual content or controls.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation ready</span>
          </div>
        </section>
        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>Check placement, optional arrow, keyboard dismissal, and theme parity.</p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setArrow(false);
                  setOpen(true);
                  setPlacement("bottom");
                  setStageTheme("System");
                }}
                variant="secondary"
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(codeExample);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
                variant="secondary"
              >
                {copied ? "Copied" : "Copy JSX"}
              </Button>
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas popover-stage" theme={resolvedTheme}>
                <Popover.Root onOpenChange={setOpen} open={open}>
                  <Popover.Trigger>
                    <span style={{ flex: 1, textAlign: "left" }}>Open popover</span>
                    <span aria-hidden="true">{open ? "⌃" : "⌄"}</span>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Positioner side={placement}>
                      <Popover.Popup aria-label="Project actions">
                        {arrow && <Popover.Arrow />}
                        <Popover.Item>Edit issue</Popover.Item>
                        <Popover.Item>Set reminder</Popover.Item>
                        <Popover.Item tone="danger">Delete</Popover.Item>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Popover</strong>
                <button type="button">Example · Default</button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Open</span>
                <input
                  checked={open}
                  onChange={(event) => setOpen(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <label className="inspector-row">
                <span>Placement</span>
                <select
                  onChange={(event) => setPlacement(event.target.value as Placement)}
                  value={placement}
                >
                  <option value="top">Top</option>
                  <option value="right">Right</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Arrow</span>
                <input
                  checked={arrow}
                  onChange={(event) => setArrow(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <label className="inspector-row">
                <span>Theme</span>
                <select
                  onChange={(event) => setStageTheme(event.target.value as StageTheme)}
                  value={stageTheme}
                >
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </label>
            </form>
          </div>
        </section>
        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Use for focused contextual controls that do not require a modal workflow.</li>
              <li>Keep the arrow optional; anchored product menus commonly omit it.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Give every popup an accessible label or connect a visible title.</li>
              <li>Base UI handles focus entry, Escape dismissal, and focus restoration.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>Composable Base UI parts with a themed portal and collision-aware positioning.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
