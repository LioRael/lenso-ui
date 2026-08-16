"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

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
    <PlaygroundSelectControl
      label={label}
      onValueChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
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
    <ComponentPage
      contentClassName="text-field-docs-content"
      description="Single-line input with label, supporting text, validation, and visible keyboard focus."
      eyebrow="Foundation component · Forms"
      metadata={["@lenso/ui/text-field", "Registry ready"]}
      name="Text Field"
      slug="text-field"
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
            name="Text Field"
            onExampleChange={() => {}}
          >
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
        }
      />

      <section className="button-guidance text-field-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>
              Use for short, structured values. Keep the visible label even when placeholder copy is
              present.
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
            Use the composition pattern below; inspect source types for the complete inherited API.
          </p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
