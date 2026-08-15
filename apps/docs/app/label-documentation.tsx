"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Label, type LabelColor } from "@lenso/ui/label";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

type PlaygroundState = "Active" | "Default" | "Hover" | "Open";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Label } from "@lenso/ui/label"

<Label color="violet">
  Feature
</Label>`;

function InspectorSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <PlaygroundSelectControl
      label={label}
      onValueChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
  );
}

const colorForMarker = (marker: string): LabelColor =>
  marker === "Purple" ? "violet" : (marker.toLowerCase() as LabelColor);

export function LabelDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [marker, setMarker] = React.useState("Red");
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");

  const reset = () => {
    setMarker("Red");
    setStageTheme("System");
    setState("Default");
  };
  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const visualState = state === "Hover" ? "hover" : state === "Active" ? "active" : undefined;
  const color = colorForMarker(marker);
  const currentCode = `<Label color="${color}">
  Feature
</Label>`;

  return (
    <DocsShell
      actions={["View source", "Planned"]}
      breadcrumbs={["Components", "Label"]}
      current="label"
      theme={pageTheme}
    >
      <div className="button-docs-content label-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Label</h1>
          <p className="button-description">
            Issue-label pill combining semantic marker color, text, and interactive states.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation planned</span>
          </div>
        </section>

        <LivePlayground
          actions={
            <>
              <Button onClick={reset} variant="secondary">
                Reset
              </Button>
              <Button
                className="copy-button"
                onClick={async () => {
                  await navigator.clipboard.writeText(currentCode);
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
              name="Label"
              onExampleChange={() => {}}
            >
              <InspectorSelect
                label="Marker"
                onChange={setMarker}
                options={["Red", "Purple", "Blue"]}
                value={marker}
              />
              <InspectorSelect
                label="State"
                onChange={(value) => setState(value as PlaygroundState)}
                options={["Default", "Hover", "Active", "Open"]}
                value={state}
              />
              <InspectorSelect
                label="Theme"
                onChange={(value) => setStageTheme(value as StageTheme)}
                options={["System", "Light", "Dark"]}
                value={stageTheme}
              />
              <PlaygroundSelectControl
                label="Advanced"
                onValueChange={() => {}}
                options={[{ label: "Internal lab", value: "internal-lab" }]}
                value="internal-lab"
              />
            </PlaygroundControls>
          }
          controlsMode="custom"
          description="Try supported variants on the real component; advanced token and motion tuning stays in the internal lab."
          preview={
            <ThemeScope className="stage-canvas" theme={resolvedStageTheme}>
              <Label color={color} data-visual-state={visualState} open={state === "Open"}>
                Label
              </Label>
              <p>Controls update this example only.</p>
            </ThemeScope>
          }
        />

        <section className="button-guidance label-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>
                Issue-label pill combining semantic marker color, text, and interactive states.
              </li>
              <li>Marker: Red, Purple, Blue</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Default, Hover, Active, Open</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation label-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Target composition API for this component; the named subpath will ship with its
              implementation.
            </p>
          </div>
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
