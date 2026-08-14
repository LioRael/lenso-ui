"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Tabs } from "@lenso/ui/tabs";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";

const values = ["overview", "documents", "members"] as const;
type TabValue = (typeof values)[number];

const codeExample = `import { Tabs } from "@lenso/ui/tabs"

<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project sections">
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="documents">Documents</Tabs.Tab>
    <Tabs.Tab value="members">Members</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">Overview content</Tabs.Panel>
</Tabs.Root>`;

export function TabsDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [selected, setSelected] = React.useState<TabValue>("overview");
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
      breadcrumbs={["Components", "Tabs"]}
      current="tabs"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · NAVIGATION</p>
          <h1>Tabs</h1>
          <p className="button-description">
            A compact peer-view switcher with keyboard navigation and consumer-owned panels.
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
              <p>Compare selection, keyboard focus, content switching, and theme parity.</p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setSelected("overview");
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
              <ThemeScope className="stage-canvas tabs-stage" theme={resolvedTheme}>
                <Tabs.Root
                  onValueChange={(value) => setSelected(value as TabValue)}
                  value={selected}
                >
                  <Tabs.List aria-label="Project sections">
                    <Tabs.Tab value="overview">Overview</Tabs.Tab>
                    <Tabs.Tab value="documents">Documents</Tabs.Tab>
                    <Tabs.Tab value="members">Members</Tabs.Tab>
                  </Tabs.List>
                  {values.map((value) => (
                    <Tabs.Panel key={value} value={value}>
                      <p>{value[0]!.toUpperCase() + value.slice(1)} content</p>
                    </Tabs.Panel>
                  ))}
                </Tabs.Root>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Tabs</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Selected</span>
                <select
                  onChange={(event) => setSelected(event.target.value as TabValue)}
                  value={selected}
                >
                  <option value="overview">Overview</option>
                  <option value="documents">Documents</option>
                  <option value="members">Members</option>
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
              <li>Use tabs for peer views within one context, not for primary navigation.</li>
              <li>Keep labels short enough to preserve the compact 28px geometry.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Give every tab list an accessible name that describes the switched views.</li>
              <li>Base UI owns roles, roving focus, arrow keys, selection, and panel linkage.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>Composable Base UI parts with StyleX visuals and consumer-owned content.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
