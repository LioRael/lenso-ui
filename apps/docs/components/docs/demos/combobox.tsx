"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Combobox } from "@lenso/ui/combobox";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";
type ExampleState = "Closed" | "Empty" | "Loading" | "Open";

const labels = ["Bug", "Feature", "Improvement"] as const;
const markerColors = ["#eb5757", "#bb87fc", "#4ea7fc"] as const;
const codeExample = `import { Combobox } from "@lenso/ui/combobox"

<Combobox.Root items={labels}>
  <Combobox.InputGroup>
    <Combobox.Input placeholder="Search labels…" />
  </Combobox.InputGroup>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          {(label) => (
            <Combobox.Item value={label}>{label}</Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
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
    <PlaygroundSelectControl
      label={label}
      onValueChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
    />
  );
}

export function ComboboxDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [state, setState] = React.useState<ExampleState>("Closed");

  const resolvedStageTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  const reset = () => {
    setStageTheme("System");
    setState("Closed");
  };

  return (
    <ComponentPage
      contentClassName="combobox-docs-content"
      description="Searchable selection control with closed, open, empty, and loading states."
      eyebrow="Foundation component · Forms"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Combobox"
      slug="combobox"
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
            name="Combobox"
            onExampleChange={() => {}}
          >
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
            <Combobox.Root items={labels} open={state !== "Closed"}>
              <Combobox.InputGroup>
                <Combobox.Input
                  disabled={state === "Loading"}
                  placeholder={state === "Loading" ? "Loading labels…" : "Change or add labels…"}
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
        }
      />

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
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
