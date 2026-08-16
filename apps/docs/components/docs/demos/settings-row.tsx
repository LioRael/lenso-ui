"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Select } from "@lenso/ui/select";
import { SettingsRow } from "@lenso/ui/settings-row";
import { Switch } from "@lenso/ui/switch";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

type Control = "action" | "select" | "toggle";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { SettingsRow } from "@lenso/ui/settings-row"

<SettingsRow.Root>
  <SettingsRow.Copy>
    <SettingsRow.Title>Setting title</SettingsRow.Title>
    <SettingsRow.Description>Supporting description.</SettingsRow.Description>
  </SettingsRow.Copy>
  <SettingsRow.Control>{control}</SettingsRow.Control>
</SettingsRow.Root>`;

function ControlExample({ control, disabled }: { control: Control; disabled: boolean }) {
  if (control === "toggle")
    return (
      <Switch.Root aria-labelledby="settings-row-example-title" checked disabled={disabled}>
        <Switch.Thumb />
      </Switch.Root>
    );
  if (control === "action")
    return (
      <Button disabled={disabled} variant="secondary">
        Customize
      </Button>
    );
  return (
    <Select.Root defaultValue="default" disabled={disabled}>
      <Select.Trigger aria-labelledby="settings-row-example-title">
        <Select.Value>Default</Select.Value>
        <Select.Icon />
      </Select.Trigger>
    </Select.Root>
  );
}

export function SettingsRowDocumentation() {
  const [control, setControl] = React.useState<Control>("select");
  const [copied, setCopied] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  return (
    <ComponentPage
      description="A consistent preference row that composes Select, Switch, Button, or consumer-owned controls."
      eyebrow="Product component · Forms"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Settings Row"
      slug="settings-row"
    >
      <LivePlayground
        actions={
          <>
            <Button
              onClick={() => {
                setControl("select");
                setDisabled(false);
                setStageTheme("System");
              }}
              variant="secondary"
            >
              Reset
            </Button>
            <Button
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
            exampleLabel="Example · Preference"
            name="Settings Row"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Control"
              onValueChange={(value) => setControl(value as Control)}
              options={[
                { label: "Select", value: "select" },
                { label: "Toggle", value: "toggle" },
                { label: "Action", value: "action" },
              ]}
              value={control}
            />
            <PlaygroundSelectControl
              label="Disabled"
              onValueChange={(value) => setDisabled(value === "True")}
              options={[
                { label: "False", value: "False" },
                { label: "True", value: "True" },
              ]}
              value={disabled ? "True" : "False"}
            />
            <PlaygroundSelectControl
              label="Theme"
              onValueChange={(value) => setStageTheme(value as StageTheme)}
              options={[
                { label: "System", value: "System" },
                { label: "Light", value: "Light" },
                { label: "Dark", value: "Dark" },
              ]}
              value={stageTheme}
            />
          </PlaygroundControls>
        }
        controlsMode="custom"
        description="Compare trailing controls, row hover, disabled treatment, and theme parity."
        preview={
          <ThemeScope className="stage-canvas settings-row-stage" theme={resolvedTheme}>
            <SettingsRow.Root disabled={disabled}>
              <SettingsRow.Copy>
                <SettingsRow.Title id="settings-row-example-title">Setting title</SettingsRow.Title>
                <SettingsRow.Description>
                  Supporting description for this preference.
                </SettingsRow.Description>
              </SettingsRow.Copy>
              <SettingsRow.Control>
                <ControlExample control={control} disabled={disabled} />
              </SettingsRow.Control>
            </SettingsRow.Root>
          </ThemeScope>
        }
      />
      <section className="button-guidance select-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>Use Switch for immediate binary preferences and Select for bounded choices.</li>
            <li>Use the Action slot for secondary configuration flows.</li>
          </ul>
        </article>
        <article>
          <h2>Accessibility</h2>
          <ul>
            <li>
              Associate the visible title with the trailing control when additional context is
              needed.
            </li>
            <li>Pass disabled state to both the row and its interactive control.</li>
          </ul>
        </article>
      </section>
      <section className="button-implementation select-implementation">
        <div>
          <h2>Implementation</h2>
          <p>
            The row owns layout only; existing controls retain their native Base UI semantics and
            behavior.
          </p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
