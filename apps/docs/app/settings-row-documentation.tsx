"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Select } from "@lenso/ui/select";
import { SettingsRow } from "@lenso/ui/settings-row";
import { Switch } from "@lenso/ui/switch";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

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
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Settings Row"]}
      current="settings-row"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">PRODUCT COMPONENT · FORMS</p>
          <h1>Settings Row</h1>
          <p className="button-description">
            A consistent preference row that composes Select, Switch, Button, or consumer-owned
            controls.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation ready</span>
          </div>
        </section>
        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>Compare trailing controls, row hover, disabled treatment, and theme parity.</p>
            </div>
            <div className="playground-actions">
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
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas settings-row-stage" theme={resolvedTheme}>
                <SettingsRow.Root disabled={disabled}>
                  <SettingsRow.Copy>
                    <SettingsRow.Title id="settings-row-example-title">
                      Setting title
                    </SettingsRow.Title>
                    <SettingsRow.Description>
                      Supporting description for this preference.
                    </SettingsRow.Description>
                  </SettingsRow.Copy>
                  <SettingsRow.Control>
                    <ControlExample control={control} disabled={disabled} />
                  </SettingsRow.Control>
                </SettingsRow.Root>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Settings Row</strong>
                <button type="button">
                  Example · Preference <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Control</span>
                <select
                  onChange={(event) => setControl(event.target.value as Control)}
                  value={control}
                >
                  <option value="select">Select</option>
                  <option value="toggle">Toggle</option>
                  <option value="action">Action</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Disabled</span>
                <input
                  checked={disabled}
                  onChange={(event) => setDisabled(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <label className="inspector-row">
                <span>Theme</span>
                <select
                  onChange={(event) => setStageTheme(event.target.value as StageTheme)}
                  value={stageTheme}
                >
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </label>
            </form>
          </div>
        </section>
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
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
