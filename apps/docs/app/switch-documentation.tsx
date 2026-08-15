"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Switch } from "@lenso/ui/switch";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

type PlaygroundSize = "Compact" | "Default";
type PlaygroundState = "Default" | "Disabled" | "Focus-visible" | "Hover" | "Pressed";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Switch } from "@lenso/ui/switch"

<Switch.Root defaultChecked>
  <Switch.Thumb />
</Switch.Root>`;

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

export function SwitchDocumentation() {
  const [checked, setChecked] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [size, setSize] = React.useState<PlaygroundSize>("Default");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");

  const reset = () => {
    setChecked(false);
    setSize("Default");
    setStageTheme("System");
    setState("Default");
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
      breadcrumbs={["Components", "Switch"]}
      current="switch"
      theme={pageTheme}
    >
      <div className="button-docs-content switch-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Switch</h1>
          <p className="button-description">
            Immediate on/off control with compact and default sizes plus stateful thumb motion.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/switch</span>
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
                <Switch.Root
                  aria-label="Switch label"
                  checked={checked}
                  data-visual-state={visualState}
                  disabled={state === "Disabled"}
                  onCheckedChange={setChecked}
                  size={size.toLowerCase() as "compact" | "default"}
                >
                  <Switch.Thumb />
                  {size === "Default" && "Switch label"}
                </Switch.Root>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Switch</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Size"
                onChange={(next) => setSize(next as PlaygroundSize)}
                options={["Default", "Compact"]}
                value={size}
              />
              <InspectorSelect
                label="On"
                onChange={(next) => setChecked(next === "True")}
                options={["False", "True"]}
                value={checked ? "True" : "False"}
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

        <section className="button-guidance switch-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>
                Immediate on/off control with compact and default sizes plus stateful thumb motion.
              </li>
              <li>Size: Default, Compact</li>
              <li>On: False, True</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Default, Hover, Pressed, Focus-visible, Disabled</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation switch-implementation">
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
