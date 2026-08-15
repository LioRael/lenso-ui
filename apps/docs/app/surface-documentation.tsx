"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Surface, type SurfaceLevel } from "@lenso/ui/surface";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Surface } from "@lenso/ui/surface"

<Surface level="panel">
  <h2>Panel title</h2>
  <p>Compose product content from existing components.</p>
</Surface>`;

export function SurfaceDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [level, setLevel] = React.useState<SurfaceLevel>("embedded");
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Surface"]}
      current="surface"
      theme={pageTheme}
    >
      <div className="button-docs-content surface-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · CONTENT</p>
          <h1>Surface</h1>
          <p className="button-description">
            A semantic hierarchy for embedded, grouped, and temporary product content.
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
              <p>Inspect hierarchy, elevation, theme parity, and custom rendering.</p>
            </div>
            <div className="playground-actions">
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
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas surface-stage" theme={resolvedTheme}>
                <Surface className="surface-demo" level={level}>
                  <h3>Panel title</h3>
                  <p>Use this region for product content assembled from existing components.</p>
                </Surface>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Surface</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Level</span>
                <select
                  onChange={(event) => setLevel(event.target.value as SurfaceLevel)}
                  value={level}
                >
                  <option>embedded</option>
                  <option>panel</option>
                  <option>overlay</option>
                </select>
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
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
