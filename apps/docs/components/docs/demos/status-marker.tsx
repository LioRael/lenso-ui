"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import {
  StatusMarker,
  type StatusMarkerPresentation,
  type StatusMarkerStatus,
} from "@lenso/ui/status-marker";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

const codeExample = `import { StatusMarker } from "@lenso/ui/status-marker"

<StatusMarker presentation="label" status="success">
  On track
</StatusMarker>`;

export function StatusMarkerDocumentation() {
  const pageTheme = useDocsPageTheme();
  const [presentation, setPresentation] = React.useState<StatusMarkerPresentation>("dot");
  const [status, setStatus] = React.useState<StatusMarkerStatus>("neutral");
  return (
    <ComponentPage
      description="Compact status signal available as a dot or labeled presentation."
      eyebrow="Foundation component · Feedback"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Status Marker"
      slug="status-marker"
    >
      <LivePlayground
        actions={
          <>
            <Button
              onClick={() => {
                setPresentation("dot");
                setStatus("neutral");
              }}
              variant="secondary"
            >
              Reset
            </Button>
          </>
        }
        controls={
          <PlaygroundControls
            example="default"
            exampleLabel="Example · Default"
            name="Status Marker"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Status"
              onValueChange={(value) => setStatus(value as StatusMarkerStatus)}
              options={[
                { label: "Neutral", value: "neutral" },
                { label: "Success", value: "success" },
                { label: "Warning", value: "warning" },
                { label: "Error", value: "error" },
                { label: "Info", value: "info" },
              ]}
              value={status}
            />
            <PlaygroundSelectControl
              label="Presentation"
              onValueChange={(value) => setPresentation(value as StatusMarkerPresentation)}
              options={[
                { label: "Dot", value: "dot" },
                { label: "Label", value: "label" },
              ]}
              value={presentation}
            />
          </PlaygroundControls>
        }
        controlsMode="custom"
        description="Try every semantic status and switch between dot and labeled presentations."
        preview={
          <ThemeScope className="stage-canvas" theme={pageTheme}>
            <StatusMarker presentation={presentation} status={status} />
          </ThemeScope>
        }
      />
      <section className="button-guidance select-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>Use Dot where adjacent text already names the status.</li>
            <li>Use Label when the marker must communicate independently.</li>
          </ul>
        </article>
        <article>
          <h2>Accessibility</h2>
          <ul>
            <li>Label presentation never relies on color alone.</li>
            <li>Dot is decorative unless the consumer supplies an accessible label.</li>
          </ul>
        </article>
      </section>
      <section className="button-implementation select-implementation">
        <div>
          <h2>Implementation</h2>
          <p>Semantic StyleX colors with consumer-owned label content.</p>
        </div>
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
