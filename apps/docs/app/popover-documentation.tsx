"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Popover } from "@lenso/ui/popover";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

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
  const pageTheme = useDocsPageTheme();
  const [placement, setPlacement] = React.useState<Placement>("bottom");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

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
        <LivePlayground
          actions={
            <>
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
            </>
          }
          controls={
            <PlaygroundControls
              example="default"
              exampleLabel="Example · Default"
              name="Popover"
              onExampleChange={() => {}}
            >
              <PlaygroundSelectControl
                label="Open"
                onValueChange={(value) => setOpen(value === "True")}
                options={[
                  { label: "False", value: "False" },
                  { label: "True", value: "True" },
                ]}
                value={open ? "True" : "False"}
              />
              <PlaygroundSelectControl
                label="Placement"
                onValueChange={(value) => setPlacement(value as Placement)}
                options={[
                  { label: "Top", value: "top" },
                  { label: "Right", value: "right" },
                  { label: "Bottom", value: "bottom" },
                  { label: "Left", value: "left" },
                ]}
                value={placement}
              />
              <PlaygroundSelectControl
                label="Arrow"
                onValueChange={(value) => setArrow(value === "True")}
                options={[
                  { label: "False", value: "False" },
                  { label: "True", value: "True" },
                ]}
                value={arrow ? "True" : "False"}
              />
              <PlaygroundSelectControl
                label="Theme"
                onValueChange={(value) => setStageTheme(value as StageTheme)}
                options={[
                  { label: "System", value: "System" },
                  { label: "Light", value: "Light" },
                  { label: "Dark", value: "Dark" },
                ]}
                value={stageTheme}
              />
            </PlaygroundControls>
          }
          controlsMode="custom"
          description="Check placement, optional arrow, keyboard dismissal, and theme parity."
          preview={
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
          }
        />
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
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
