"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Label, type LabelColor } from "@lenso/ui/label";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

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
    <label className="inspector-row">
      <span>{label}</span>
      <span className="inspector-control-wrap">
        <select onChange={(event) => onChange(event.target.value)} value={value}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <span aria-hidden="true" className="inspector-chevron">
          ⌄
        </span>
      </span>
    </label>
  );
}

const colorForMarker = (marker: string): LabelColor =>
  marker === "Purple" ? "violet" : (marker.toLowerCase() as LabelColor);

export function LabelDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [marker, setMarker] = React.useState("Red");
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const reset = () => {
    setMarker("Red");
    setStageTheme("System");
    setState("Default");
  };
  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const visualState = state === "Hover" ? "hover" : state === "Active" ? "active" : undefined;
  const color = colorForMarker(marker);
  const currentCode = `<Label color="${color}">Feature</Label>`;

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

        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>
                Try supported variants on the real component; advanced token and motion tuning stays
                in the internal lab.
              </p>
            </div>
            <div className="playground-actions">
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
            </div>
          </div>

          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas" theme={resolvedStageTheme}>
                <Label color={color} data-visual-state={visualState} open={state === "Open"}>
                  Label
                </Label>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Label</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
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
              <div className="inspector-row">
                <span>Advanced</span>
                <button className="inspector-static-control" type="button">
                  Internal lab <span aria-hidden="true">⌄</span>
                </button>
              </div>
            </form>
          </div>
        </section>

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
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
