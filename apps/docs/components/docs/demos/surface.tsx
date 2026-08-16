"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Surface, type SurfaceLevel } from "@lenso/ui/surface";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Surface } from "@lenso/ui/surface"

<Surface level="panel">
  <h2>Panel title</h2>
  <p>Compose product content from existing components.</p>
</Surface>`;

export function SurfaceDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [level, setLevel] = React.useState<SurfaceLevel>("embedded");
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <ComponentPage
      contentClassName="surface-docs-content"
      description="A semantic hierarchy for embedded, grouped, and temporary product content."
      eyebrow="Foundation component · Content"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Surface"
      slug="surface"
    >
      <LivePlayground
        actions={
          <>
            <Button
              onClick={() => {
                setLevel("embedded");
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
            name="Surface"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Level"
              onValueChange={(value) => setLevel(value as SurfaceLevel)}
              options={[
                { label: "embedded", value: "embedded" },
                { label: "panel", value: "panel" },
                { label: "overlay", value: "overlay" },
              ]}
              value={level}
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
        description="Inspect hierarchy, elevation, theme parity, and custom rendering."
        preview={
          <ThemeScope className="stage-canvas surface-stage" theme={resolvedTheme}>
            <Surface className="surface-demo" level={level}>
              <h3>Panel title</h3>
              <p>Use this region for product content assembled from existing components.</p>
            </Surface>
          </ThemeScope>
        }
      />

      <section className="button-guidance select-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>Use Embedded for in-flow content and Panel for related settings or content.</li>
            <li>Reserve Overlay for temporary floating UI such as menus and popovers.</li>
          </ul>
        </article>
        <article>
          <h2>Accessibility</h2>
          <ul>
            <li>Choose the rendered element and accessible name for the content it groups.</li>
          </ul>
        </article>
      </section>
      <section className="button-implementation select-implementation">
        <div>
          <h2>Implementation</h2>
          <p>Surface owns visual hierarchy only and accepts a custom element through render.</p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
