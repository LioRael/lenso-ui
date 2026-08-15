"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";

import { IconButton, type IconButtonSize, type IconButtonVariant } from "@lenso/ui/icon-button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { Button } from "@lenso/ui/button";
import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

type PlaygroundState = "Default" | "Disabled" | "Focus visible" | "Hover" | "Pressed" | "Selected";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { IconButton } from "@lenso/ui/icon-button"
import { PlusIcon } from "lucide-react"

<IconButton aria-label="Create issue">
  <PlusIcon />
</IconButton>`;

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

export function IconButtonDocumentation() {
  const pageTheme = useDocsPageTheme();
  const [size, setSize] = React.useState<IconButtonSize>("compact");
  const [state, setState] = React.useState<PlaygroundState>("Default");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [variant, setVariant] = React.useState<IconButtonVariant>("secondary");
  const [copied, setCopied] = React.useState(false);

  const reset = () => {
    setSize("compact");
    setState("Default");
    setStageTheme("System");
    setVariant("secondary");
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
  const currentCode = `<IconButton aria-label="Create issue" variant="${variant}" size="${size}"><PlusIcon /></IconButton>`;

  return (
    <DocsShell
      actions={["View source", "Planned"]}
      breadcrumbs={["Components", "Icon Button"]}
      current="icon-button"
      theme={pageTheme}
    >
      <div className="button-docs-content icon-button-docs-content">
        <section className="button-overview icon-button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · ACTIONS</p>
          <h1>Icon Button</h1>
          <p className="button-description">
            Compact icon-only action with a stable interaction target and centered glyph.
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
                <IconButton
                  aria-label="Create issue"
                  data-visual-state={visualState}
                  disabled={state === "Disabled"}
                  selected={state === "Selected"}
                  size={size}
                  variant={variant}
                >
                  <PlusIcon />
                </IconButton>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>

            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Icon Button</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Tone"
                onChange={(value) => setVariant(value.toLowerCase() as IconButtonVariant)}
                options={["Secondary", "Ghost"]}
                value={variant[0]!.toUpperCase() + variant.slice(1)}
              />
              <InspectorSelect
                label="Size"
                onChange={(value) => setSize(value.toLowerCase() as IconButtonSize)}
                options={["Compact", "Default"]}
                value={size[0]!.toUpperCase() + size.slice(1)}
              />
              <InspectorSelect
                label="State"
                onChange={(value) => setState(value as PlaygroundState)}
                options={["Default", "Hover", "Pressed", "Focus visible", "Selected", "Disabled"]}
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

        <section className="button-guidance icon-button-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Compact icon-only action with a stable interaction target and centered glyph.</li>
              <li>Tone: Secondary, Ghost</li>
              <li>Size: Compact, Default</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Default, Hover, Pressed, Focus-visible, Selected, Disabled</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation icon-button-implementation">
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
