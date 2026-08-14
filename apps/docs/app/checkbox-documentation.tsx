"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Checkbox } from "@lenso/ui/checkbox";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type CheckboxValue = "Indeterminate" | "Off" | "On";
type PlaygroundState = "Default" | "Disabled" | "Focus-visible" | "Hover" | "Pressed";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Checkbox } from "@lenso/ui/checkbox"

<Checkbox.Root defaultChecked>
  <Checkbox.Indicator />
  <Checkbox.Label>Include completed issues</Checkbox.Label>
</Checkbox.Root>`;

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

export function CheckboxDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");
  const [value, setValue] = React.useState<CheckboxValue>("Off");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const reset = () => {
    setStageTheme("System");
    setState("Default");
    setValue("Off");
  };
  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const visualState =
    state === "Hover"
      ? "hover"
      : state === "Pressed"
        ? "pressed"
        : state === "Focus-visible"
          ? "focus-visible"
          : undefined;

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Checkbox"]}
      current="checkbox"
      theme={pageTheme}
    >
      <div className="button-docs-content checkbox-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Checkbox</h1>
          <p className="button-description">
            Binary or indeterminate form control with a visible label and keyboard focus.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/checkbox</span>
            <span>Registry ready</span>
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
              <ThemeScope className="stage-canvas" theme={resolvedStageTheme}>
                <Checkbox.Root
                  checked={value === "On"}
                  data-visual-state={visualState}
                  disabled={state === "Disabled"}
                  indeterminate={value === "Indeterminate"}
                  onCheckedChange={(checked) => setValue(checked ? "On" : "Off")}
                >
                  <Checkbox.Indicator />
                  <Checkbox.Label>Checkbox label</Checkbox.Label>
                </Checkbox.Root>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Checkbox</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Value"
                onChange={(next) => setValue(next as CheckboxValue)}
                options={["Off", "On", "Indeterminate"]}
                value={value}
              />
              <InspectorSelect
                label="State"
                onChange={(next) => setState(next as PlaygroundState)}
                options={["Default", "Hover", "Pressed", "Focus-visible", "Disabled"]}
                value={state}
              />
              <InspectorSelect
                label="Theme"
                onChange={(next) => setStageTheme(next as StageTheme)}
                options={["System", "Light", "Dark"]}
                value={stageTheme}
              />
              <div className="inspector-row">
                <span>Advanced</span>
                <button className="inspector-static-control" type="button">
                  Internal lab
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="button-guidance checkbox-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Binary or indeterminate form control with a visible label and keyboard focus.</li>
              <li>Value: Off, On, Indeterminate</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Default, Hover, Pressed, Focus-visible, Disabled</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation checkbox-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Use the composition pattern below; inspect source types for the complete inherited
              API.
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
