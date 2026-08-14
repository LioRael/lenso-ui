"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { Tooltip } from "@lenso/ui/tooltip";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Tooltip } from "@lenso/ui/tooltip"

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger render={<button type="button" />}>Help</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          Help with <Tooltip.Shortcut>?</Tooltip.Shortcut>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>`;

export function TooltipDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [shortcut, setShortcut] = React.useState(true);
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
      breadcrumbs={["Components", "Tooltip"]}
      current="tooltip"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · OVERLAYS</p>
          <h1>Tooltip</h1>
          <p className="button-description">
            Compact contextual help for controls, with optional shortcut guidance.
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
              <p>Check hover, keyboard focus, Escape dismissal, shortcut, and theme parity.</p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setShortcut(true);
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
              <ThemeScope className="stage-canvas tooltip-stage" theme={resolvedTheme}>
                <Tooltip.Provider closeDelay={0} delay={200}>
                  <Tooltip.Root defaultOpen>
                    <Tooltip.Trigger render={<Button variant="secondary" />}>
                      Hover for help
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Positioner>
                        <Tooltip.Popup>
                          Help with
                          {shortcut && <Tooltip.Shortcut>?</Tooltip.Shortcut>}
                        </Tooltip.Popup>
                      </Tooltip.Positioner>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Tooltip</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Shortcut</span>
                <input
                  checked={shortcut}
                  onChange={(event) => setShortcut(event.target.checked)}
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
              <li>Use concise supporting text; never place essential actions inside a tooltip.</li>
              <li>Add a shortcut only when it helps users repeat the trigger action.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Base UI exposes the tooltip on both pointer hover and keyboard focus.</li>
              <li>Escape dismisses it without moving focus away from the trigger.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>A themed portal with collision-aware positioning and an 8px target offset.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
