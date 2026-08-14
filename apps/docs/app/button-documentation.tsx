"use client";

import * as React from "react";

import { Button, type ButtonSize, type ButtonVariant } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type PlaygroundState = "Default" | "Disabled" | "Focus visible" | "Hover" | "Loading" | "Pressed";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Button } from "@lenso/ui/button"

<Button variant="primary" size="compact">
  Create issue
</Button>`;

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

export function ButtonDocumentation() {
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [label, setLabel] = React.useState("Continue");
  const [size, setSize] = React.useState<ButtonSize>("compact");
  const [state, setState] = React.useState<PlaygroundState>("Default");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [variant, setVariant] = React.useState<ButtonVariant>("primary");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const reset = () => {
    setLabel("Continue");
    setSize("compact");
    setState("Default");
    setStageTheme("System");
    setVariant("primary");
  };
  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const visualState =
    state === "Hover"
      ? "hover"
      : state === "Pressed"
        ? "pressed"
        : state === "Focus visible"
          ? "focus-visible"
          : undefined;
  const currentCode = `<Button variant="${variant}" size="${size}">${label}</Button>`;

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Button"]}
      current="button"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · ACTIONS</p>
          <h1>Button</h1>
          <p className="button-description">
            Pill-shaped action control with predictable emphasis, compact density, and complete
            interaction states.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/button</span>
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
                <Button
                  data-visual-state={visualState}
                  disabled={state === "Disabled"}
                  loading={state === "Loading"}
                  size={size}
                  variant={variant}
                >
                  {label}
                </Button>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Button</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Tone"
                onChange={(value) => setVariant(value.toLowerCase() as ButtonVariant)}
                options={["Primary", "Secondary", "Ghost", "Danger"]}
                value={variant[0]!.toUpperCase() + variant.slice(1)}
              />
              <InspectorSelect
                label="Size"
                onChange={(value) => setSize(value.toLowerCase() as ButtonSize)}
                options={["Compact", "Default"]}
                value={size[0]!.toUpperCase() + size.slice(1)}
              />
              <InspectorSelect
                label="State"
                onChange={(value) => setState(value as PlaygroundState)}
                options={["Default", "Hover", "Pressed", "Focus visible", "Disabled", "Loading"]}
                value={state}
              />
              <label className="inspector-row">
                <span>Label</span>
                <input onChange={(event) => setLabel(event.target.value)} value={label} />
              </label>
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

        <section className="button-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Use for explicit, user-initiated actions.</li>
              <li>Keep one primary action per focused surface.</li>
              <li>Use Ghost only for low-emphasis or toolbar actions.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Use a clear action label; icon-only actions need an accessible name.</li>
              <li>Preserve focus-visible and loading feedback.</li>
              <li>Disabled actions must not be the only explanation.</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation">
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
