"use client";

import * as React from "react";

import { Avatar } from "@lenso/ui/avatar";
import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";
type DemoSize = "compact" | "default" | "large" | "xlarge";
type DemoStatus = "away" | "busy" | "offline" | "online";

const codeExample = `import { Avatar } from "@lenso/ui/avatar"

<Avatar.Root size="default">
  <Avatar.Image alt="Lenso member" src="/avatar.jpg" />
  <Avatar.Fallback>LR</Avatar.Fallback>
  <Avatar.Status attached state="online" />
</Avatar.Root>`;

export function AvatarDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [size, setSize] = React.useState<DemoSize>("default");
  const [status, setStatus] = React.useState<DemoStatus>("online");

  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Avatar"]}
      current="avatar"
      theme={pageTheme}
    >
      <div className="button-docs-content avatar-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · CONTENT</p>
          <h1>Avatar</h1>
          <p className="button-description">
            Image and fallback avatars, status, sizes, and avatar groups.
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
              <p>Check sizing, fallback content, presence, grouping, and theme-aware separators.</p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setSize("default");
                  setStatus("online");
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
              <ThemeScope className="stage-canvas avatar-stage" theme={resolvedTheme}>
                <Avatar.Root size={size}>
                  <Avatar.Fallback>LR</Avatar.Fallback>
                  <Avatar.Status
                    attached
                    size={size === "large" || size === "xlarge" ? "default" : "small"}
                    state={status}
                  />
                </Avatar.Root>
                <Avatar.Group>
                  <Avatar.Root size="default">
                    <Avatar.Fallback>L</Avatar.Fallback>
                  </Avatar.Root>
                  <Avatar.Root size="default">
                    <Avatar.Fallback>LR</Avatar.Fallback>
                  </Avatar.Root>
                  <Avatar.Root size="default">
                    <Avatar.Fallback>L</Avatar.Fallback>
                  </Avatar.Root>
                </Avatar.Group>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Avatar</strong>
                <button type="button">
                  Example · Default <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Size</span>
                <select onChange={(event) => setSize(event.target.value as DemoSize)} value={size}>
                  <option>compact</option>
                  <option>default</option>
                  <option>large</option>
                  <option>xlarge</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Status</span>
                <select
                  onChange={(event) => setStatus(event.target.value as DemoStatus)}
                  value={status}
                >
                  <option>online</option>
                  <option>away</option>
                  <option>busy</option>
                  <option>offline</option>
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
              <li>Always provide meaningful image alt text or a concise fallback.</li>
              <li>Use groups for compact collaborative identity, not as a people picker.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Presence status exposes an accessible state label by default.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Base UI owns image loading and fallback behavior; all visual parts remain replaceable.
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
