"use client";

import * as React from "react";

import { Avatar } from "@lenso/ui/avatar";
import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

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
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [size, setSize] = React.useState<DemoSize>("default");
  const [status, setStatus] = React.useState<DemoStatus>("online");

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

        <LivePlayground
          actions={
            <>
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
            </>
          }
          controls={
            <PlaygroundControls
              example="default"
              exampleLabel="Example · Default"
              name="Avatar"
              onExampleChange={() => {}}
            >
              <PlaygroundSelectControl
                label="Size"
                onValueChange={(value) => setSize(value as DemoSize)}
                options={[
                  { label: "compact", value: "compact" },
                  { label: "default", value: "default" },
                  { label: "large", value: "large" },
                  { label: "xlarge", value: "xlarge" },
                ]}
                value={size}
              />
              <PlaygroundSelectControl
                label="Status"
                onValueChange={(value) => setStatus(value as DemoStatus)}
                options={[
                  { label: "online", value: "online" },
                  { label: "away", value: "away" },
                  { label: "busy", value: "busy" },
                  { label: "offline", value: "offline" },
                ]}
                value={status}
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
          description="Check sizing, fallback content, presence, grouping, and theme-aware separators."
          preview={
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
          }
        />

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
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
