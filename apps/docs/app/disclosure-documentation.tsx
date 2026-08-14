"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Disclosure } from "@lenso/ui/disclosure";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Disclosure } from "@lenso/ui/disclosure"

<Disclosure.Root defaultValue={["workspace"]}>
  <Disclosure.Item value="workspace">
    <Disclosure.Header>
      <Disclosure.Trigger>
        Workspace <Disclosure.Icon />
      </Disclosure.Trigger>
    </Disclosure.Header>
    <Disclosure.Panel>Projects and workspace views.</Disclosure.Panel>
  </Disclosure.Item>
</Disclosure.Root>`;

function DisclosureDemo({ multiple }: { multiple: boolean }) {
  return (
    <Disclosure.Root defaultValue={["workspace"]} key={String(multiple)} multiple={multiple}>
      <Disclosure.Item value="workspace">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Workspace <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Projects and workspace views.</Disclosure.Panel>
      </Disclosure.Item>
      <Disclosure.Item value="projects">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Projects <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Active</span>
            <span>Archived</span>
            <span>More</span>
          </div>
        </Disclosure.Panel>
      </Disclosure.Item>
      <Disclosure.Item value="views">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Views <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Saved filters and shared views.</Disclosure.Panel>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

export function DisclosureDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [multiple, setMultiple] = React.useState(false);
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
      breadcrumbs={["Components", "Disclosure"]}
      current="disclosure"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · NAVIGATION</p>
          <h1>Disclosure</h1>
          <p className="button-description">
            Compact expandable sections for progressive navigation and supporting content.
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
                Check single or multiple expansion, keyboard behavior, animation, and theme parity.
              </p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setMultiple(false);
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
              <ThemeScope className="stage-canvas" theme={resolvedTheme}>
                <DisclosureDemo multiple={multiple} />
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Disclosure</strong>
                <button type="button">
                  Example · Group <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Multiple</span>
                <input
                  checked={multiple}
                  onChange={(event) => setMultiple(event.target.checked)}
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
              <li>Use disclosure for optional supporting content, not essential task steps.</li>
              <li>Choose single expansion when sections compete for the same compact space.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Base UI connects each trigger to its panel and exposes expanded state.</li>
              <li>Triggers remain native buttons and support Enter and Space.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Base UI owns accordion state and semantics; every visible part remains composable and
              replaceable.
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
