"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

type PlaygroundState =
  | "Active"
  | "Default"
  | "Disabled"
  | "Error"
  | "Focus-visible"
  | "Hover"
  | "Read-only";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { TextField } from "@lenso/ui/text-field"

<TextField.Root>
  <TextField.Label>Project name</TextField.Label>
  <TextField.Control placeholder="Untitled" />
  <TextField.Description>Visible to your team.</TextField.Description>
</TextField.Root>`;

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

export function TextFieldDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");

  const reset = () => {
    setStageTheme("System");
    setState("Default");
  };
  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const visualState =
    state === "Hover"
      ? "hover"
      : state === "Active"
        ? "active"
        : state === "Focus-visible"
          ? "focus-visible"
          : undefined;
  const invalid = state === "Error";

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Text Field"]}
      current="text-field"
      theme={pageTheme}
    >
      <div className="button-docs-content text-field-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Text Field</h1>
          <p className="button-description">
            Single-line input with label, supporting text, validation, and visible keyboard focus.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/text-field</span>
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
                <TextField.Root disabled={state === "Disabled"} invalid={invalid}>
                  <TextField.Label>Field label</TextField.Label>
                  <TextField.Control
                    data-visual-state={visualState}
                    placeholder="Enter value"
                    readOnly={state === "Read-only"}
                  />
                  {invalid ? (
                    <TextField.Error match>Resolve this field before continuing.</TextField.Error>
                  ) : (
                    <TextField.Description>
                      {state === "Active" || state === "Focus-visible"
                        ? "Ready for input."
                        : "Optional supporting text."}
                    </TextField.Description>
                  )}
                </TextField.Root>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Text Field</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Size"
                onChange={() => {}}
                options={["Default"]}
                value="Default"
              />
              <InspectorSelect
                label="Patterns"
                onChange={() => {}}
                options={["Search", "Leading icon"]}
                value="Search"
              />
              <InspectorSelect
                label="State"
                onChange={(value) => setState(value as PlaygroundState)}
                options={[
                  "Default",
                  "Hover",
                  "Active",
                  "Focus-visible",
                  "Error",
                  "Read-only",
                  "Disabled",
                ]}
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

        <section className="button-guidance text-field-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>
                Use for short, structured values. Keep the visible label even when placeholder copy
                is present.
              </li>
              <li>Size: Default</li>
              <li>Patterns: Search, Leading icon</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Default, Hover, Active, Focus-visible, Error, Read-only, Disabled</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation text-field-implementation">
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
