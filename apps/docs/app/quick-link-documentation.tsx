"use client";

import * as React from "react";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";

import { Button } from "@lenso/ui/button";
import { QuickLink } from "@lenso/ui/quick-link";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { QuickLink } from "@lenso/ui/quick-link"

<QuickLink
  render={<Link href="/settings" />}
  leadingIcon={<SettingsIcon />}
  trailingIcon={<ChevronRightIcon />}
>
  Team settings
</QuickLink>`;

export function QuickLinkDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
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
      breadcrumbs={["Components", "Quick Link"]}
      current="quick-link"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · NAVIGATION</p>
          <h1>Quick Link</h1>
          <p className="button-description">
            A compact contextual link with stable icon geometry and progressive hover affordance.
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
                Inspect hover disclosure, disabled behavior, custom rendering, and theme parity.
              </p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setDisabled(false);
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
                <QuickLink
                  disabled={disabled}
                  leadingIcon={<SettingsIcon size={16} />}
                  trailingIcon={<ChevronRightIcon size={14} />}
                >
                  Team settings
                </QuickLink>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Quick Link</strong>
                <button type="button">
                  Example · Settings <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Disabled</span>
                <input
                  checked={disabled}
                  onChange={(event) => setDisabled(event.target.checked)}
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
              <li>Use for compact contextual destinations such as settings and team resources.</li>
              <li>Keep labels short enough to remain a single line.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Use render composition with a real link when the action navigates.</li>
              <li>
                The trailing chevron is decorative and does not duplicate the accessible name.
              </li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Base UI owns button and render composition behavior; both icon slots remain
              consumer-controlled.
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
