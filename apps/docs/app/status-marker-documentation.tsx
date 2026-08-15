"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import {
  StatusMarker,
  type StatusMarkerPresentation,
  type StatusMarkerStatus,
} from "@lenso/ui/status-marker";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { DocsShell } from "./docs-shell";

const codeExample = `import { StatusMarker } from "@lenso/ui/status-marker"

<StatusMarker presentation="label" status="success">
  On track
</StatusMarker>`;

export function StatusMarkerDocumentation() {
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [presentation, setPresentation] = React.useState<StatusMarkerPresentation>("dot");
  const [status, setStatus] = React.useState<StatusMarkerStatus>("neutral");
  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);
  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Status Marker"]}
      current="status-marker"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FEEDBACK</p>
          <h1>Status Marker</h1>
          <p className="button-description">
            Compact status signal available as a dot or labeled presentation.
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
              <p>Try every semantic status and switch between dot and labeled presentations.</p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setPresentation("dot");
                  setStatus("neutral");
                }}
                variant="secondary"
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas" theme={pageTheme}>
                <StatusMarker presentation={presentation} status={status} />
              </ThemeScope>
            </article>
            <aside className="playground-inspector">
              <div className="inspector-header">
                <strong>Status Marker</strong>
                <button type="button">Example · Default</button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Status</span>
                <select
                  onChange={(event) => setStatus(event.target.value as StatusMarkerStatus)}
                  value={status}
                >
                  <option value="neutral">Neutral</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="info">Info</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Presentation</span>
                <select
                  onChange={(event) =>
                    setPresentation(event.target.value as StatusMarkerPresentation)
                  }
                  value={presentation}
                >
                  <option value="dot">Dot</option>
                  <option value="label">Label</option>
                </select>
              </label>
            </aside>
          </div>
        </section>
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
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
