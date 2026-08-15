"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { RadioGroup } from "@lenso/ui/radio";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

type PlaygroundState = "Default" | "Disabled" | "Focus-visible" | "Hover" | "Pressed";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { RadioGroup } from "@lenso/ui/radio"

<RadioGroup.Root defaultValue="compact">
  <RadioGroup.Item value="compact">
    <RadioGroup.Indicator />
    Compact
  </RadioGroup.Item>
</RadioGroup.Root>`;

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

export function RadioDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [selected, setSelected] = React.useState(false);
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");

  const reset = () => {
    setSelected(false);
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
      breadcrumbs={["Components", "Radio"]}
      current="radio"
      theme={pageTheme}
    >
      <div className="button-docs-content radio-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Radio</h1>
          <p className="button-description">
            Single-choice control for mutually exclusive options within a named group.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/radio</span>
            <span>Registry ready</span>
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
              name="Radio"
              onExampleChange={() => {}}
            >
              <InspectorSelect
                label="Selected"
                onChange={(next) => setSelected(next === "True")}
                options={["False", "True"]}
                value={selected ? "True" : "False"}
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
              <RadioGroup.Root value={selected ? "example" : "other"}>
                <RadioGroup.Item
                  data-visual-state={visualState}
                  disabled={state === "Disabled"}
                  onClick={() => setSelected(true)}
                  value="example"
                >
                  <RadioGroup.Indicator />
                  Radio label
                </RadioGroup.Item>
              </RadioGroup.Root>
              <p>Controls update this example only.</p>
            </ThemeScope>
          }
        />

        <section className="button-guidance radio-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Single-choice control for mutually exclusive options within a named group.</li>
              <li>Selected: False, True</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Default, Hover, Pressed, Focus-visible, Disabled</li>
            </ul>
          </article>
        </section>

        <section className="button-implementation radio-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Use the composition pattern below; inspect source types for the complete inherited
              API.
            </p>
          </div>
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
