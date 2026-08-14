"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Combobox } from "@lenso/ui/combobox";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";
type ExampleState = "Closed" | "Empty" | "Loading" | "Open";

const labels = ["Bug", "Feature", "Improvement"] as const;
const markerColors = ["#eb5757", "#bb87fc", "#4ea7fc"] as const;
const codeExample = `import { Combobox } from "@lenso/ui/combobox"

<Combobox.Root items={labels}>
  <Combobox.InputGroup><Combobox.Input placeholder="Search labels…" /></Combobox.InputGroup>
  <Combobox.Portal><Combobox.Positioner><Combobox.Popup>
    <Combobox.List>{(label) => <Combobox.Item value={label}>{label}</Combobox.Item>}</Combobox.List>
  </Combobox.Popup></Combobox.Positioner></Combobox.Portal>
</Combobox.Root>`;

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

export function ComboboxDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<ExampleState>("Closed");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const reset = () => {
    setStageTheme("System");
    setState("Closed");
  };

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Combobox"]}
      current="combobox"
      theme={pageTheme}
    >
      <div className="button-docs-content combobox-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FORMS</p>
          <h1>Combobox</h1>
          <p className="button-description">
            Searchable selection control with closed, open, empty, and loading states.
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
                <Combobox.Root items={labels} open={state !== "Closed"}>
                  <Combobox.InputGroup>
                    <Combobox.Input
                      disabled={state === "Loading"}
                      placeholder={
                        state === "Loading" ? "Loading labels…" : "Change or add labels…"
                      }
                    />
                    <Combobox.Shortcut>L</Combobox.Shortcut>
                  </Combobox.InputGroup>
                  <Combobox.Portal>
                    <Combobox.Positioner>
                      <Combobox.Popup>
                        {state === "Loading" ? (
                          <Combobox.Status>Loading labels…</Combobox.Status>
                        ) : state === "Empty" ? (
                          <Combobox.Empty>No labels found</Combobox.Empty>
                        ) : (
                          <Combobox.List>
                            {(label: string) => {
                              const index = labels.indexOf(label as (typeof labels)[number]);
                              return (
                                <Combobox.Item key={label} value={label}>
                                  <Combobox.ItemIndicator />
                                  <Combobox.Marker style={{ color: markerColors[index] }} />
                                  <Combobox.ItemText>{label}</Combobox.ItemText>
                                </Combobox.Item>
                              );
                            }}
                          </Combobox.List>
                        )}
                      </Combobox.Popup>
                    </Combobox.Positioner>
                  </Combobox.Portal>
                </Combobox.Root>
                <p>Controls update this example only.</p>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Combobox</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <InspectorSelect
                label="State"
                onChange={(next) => setState(next as ExampleState)}
                options={["Closed", "Open", "Empty", "Loading"]}
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

        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Searchable selection control with closed, open, empty, and loading states.</li>
              <li>Single canonical anatomy.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>State: Closed, Open, Empty, Loading</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>Use the composition API below; every visual part remains consumer replaceable.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
