"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { Tooltip } from "@lenso/ui/tooltip";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Tooltip } from "@lenso/ui/tooltip"

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger render={<button type="button" />}>Help</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          Help with <Tooltip.Shortcut>?</Tooltip.Shortcut>
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>`;

export function TooltipDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [shortcut, setShortcut] = React.useState(true);
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <ComponentPage
      description="Compact contextual help for controls, with optional shortcut guidance."
      eyebrow="Foundation component · Overlays"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Tooltip"
      slug="tooltip"
    >
      <LivePlayground
        actions={
          <>
            <Button
              onClick={() => {
                setShortcut(true);
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
            exampleLabel="Example · Default"
            name="Tooltip"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Shortcut"
              onValueChange={(value) => setShortcut(value === "True")}
              options={[
                { label: "False", value: "False" },
                { label: "True", value: "True" },
              ]}
              value={shortcut ? "True" : "False"}
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
        description="Check hover, keyboard focus, Escape dismissal, shortcut, and theme parity."
        preview={
          <ThemeScope className="stage-canvas tooltip-stage" theme={resolvedTheme}>
            <Tooltip.Provider closeDelay={0} delay={200}>
              <Tooltip.Root defaultOpen>
                <Tooltip.Trigger render={<Button variant="secondary" />}>
                  Hover for help
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner>
                    <Tooltip.Popup>
                      Help with
                      {shortcut && <Tooltip.Shortcut>?</Tooltip.Shortcut>}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </ThemeScope>
        }
      />
      <section className="button-guidance select-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>Use concise supporting text; never place essential actions inside a tooltip.</li>
            <li>Add a shortcut only when it helps users repeat the trigger action.</li>
          </ul>
        </article>
        <article>
          <h2>Accessibility</h2>
          <ul>
            <li>Base UI exposes the tooltip on both pointer hover and keyboard focus.</li>
            <li>Escape dismisses it without moving focus away from the trigger.</li>
          </ul>
        </article>
      </section>
      <section className="button-implementation select-implementation">
        <div>
          <h2>Implementation</h2>
          <p>A themed portal with collision-aware positioning and an 8px target offset.</p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
