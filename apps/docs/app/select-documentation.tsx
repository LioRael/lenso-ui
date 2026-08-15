"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Select } from "@lenso/ui/select";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";
const values = ["Smaller", "Small", "Default", "Large", "Larger"] as const;
const selections = ["First", "Second", "Third", "Fourth", "Fifth"] as const;
const positions = ["Popper", "Item aligned"] as const;

const codeExample = `import { Select } from "@lenso/ui/select"

<Select.Root defaultValue="default">
  <Select.Trigger><Select.Value /><Select.Icon /></Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup><Select.List>
        <Select.Item value="default"><Select.ItemText>Default</Select.ItemText><Select.ItemIndicator /></Select.Item>
      </Select.List></Select.Popup>
    </Select.Positioner></Select.Portal>
</Select.Root>`;

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

export function SelectDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [position, setPosition] = React.useState<(typeof positions)[number]>("Popper");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const reset = () => {
    setOpen(false);
    setPosition("Popper");
    setSelectedIndex(0);
    setStageTheme("System");
  };

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Select"]}
      current="select"
      theme={pageTheme}
    >
      <div className="button-docs-content select-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Select</h1>
          <p className="button-description">
            Closed and open single-selection control for choosing from a short option list.
          </p>
          <div className="metadata-pills button-metadata">
            <span>@lenso/ui/select</span>
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
                <Select.Root
                  onOpenChange={setOpen}
                  onValueChange={(value) =>
                    setSelectedIndex(Math.max(0, values.indexOf(value as (typeof values)[number])))
                  }
                  open={open}
                  value={values[selectedIndex]}
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner
                      position={position === "Item aligned" ? "item-aligned" : "popper"}
                    >
                      <Select.Popup>
                        <Select.List>
                          {values.map((value) => (
                            <Select.Item key={value} value={value}>
                              <Select.ItemText>{value}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Select</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="Expanded"
                onChange={(next) => setOpen(next === "True")}
                options={["False", "True"]}
                value={open ? "True" : "False"}
              />
              <InspectorSelect
                label="Selected"
                onChange={(next) =>
                  setSelectedIndex(selections.indexOf(next as (typeof selections)[number]))
                }
                options={selections}
                value={selections[selectedIndex] ?? "First"}
              />
              <InspectorSelect
                label="Position"
                onChange={(next) => setPosition(next as (typeof positions)[number])}
                options={positions}
                value={position}
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

        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>
                Closed and open single-selection control for choosing from a short option list.
              </li>
              <li>Expanded: False, True</li>
              <li>Selected: First, Second, Third, Fourth, Fifth</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>
                Keyboard navigation, selection, dismissal, and focus restoration are provided by
                Base UI.
              </li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
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
