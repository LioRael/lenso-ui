"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Checkbox } from "@lenso/ui/checkbox";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

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
    <PlaygroundSelectControl
      label={label}
      onValueChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
  );
}

export function CheckboxDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<PlaygroundState>("Default");
  const [value, setValue] = React.useState<CheckboxValue>("Off");

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
    <ComponentPage
      contentClassName="checkbox-docs-content"
      description="Binary or indeterminate form control with a visible label and keyboard focus."
      eyebrow="Foundation component · Forms"
      metadata={["@lenso/ui/checkbox", "Registry ready"]}
      name="Checkbox"
      slug="checkbox"
    >
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
            name="Checkbox"
            onExampleChange={() => {}}
          >
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
        }
      />

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
            Use the composition pattern below; inspect source types for the complete inherited API.
          </p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
