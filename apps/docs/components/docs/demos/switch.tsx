"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Switch } from "@lenso/ui/switch";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

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
    <PlaygroundSelectControl
      label={label}
      onValueChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
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
    <ComponentPage
      contentClassName="switch-docs-content"
      description="Immediate on/off control with compact and default sizes plus stateful thumb motion."
      eyebrow="Foundation component · Forms"
      metadata={["@lenso/ui/switch", "Registry ready"]}
      name="Switch"
      slug="switch"
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
            name="Switch"
            onExampleChange={() => {}}
          >
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
        }
      />

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
            Use the composition pattern below; inspect source types for the complete inherited API.
          </p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
