"use client";

import * as React from "react";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";

import { Button } from "@lenso/ui/button";
import { QuickLink } from "@lenso/ui/quick-link";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { QuickLink } from "@lenso/ui/quick-link"

<QuickLink
  render={<Link href="/settings" />}
  nativeButton={false}
  leadingIcon={<SettingsIcon />}
  trailingIcon={<ChevronRightIcon />}
>
  Team settings
</QuickLink>`;

export function QuickLinkDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
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
        <LivePlayground
          actions={
            <>
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
            </>
          }
          controls={
            <PlaygroundControls
              example="default"
              exampleLabel="Example · Settings"
              name="Quick Link"
              onExampleChange={() => {}}
            >
              <PlaygroundSelectControl
                label="Disabled"
                onValueChange={(value) => setDisabled(value === "True")}
                options={[
                  { label: "False", value: "False" },
                  { label: "True", value: "True" },
                ]}
                value={disabled ? "True" : "False"}
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
          description="Inspect hover disclosure, disabled behavior, custom rendering, and theme parity."
          preview={
            <ThemeScope className="stage-canvas" theme={resolvedTheme}>
              <QuickLink
                disabled={disabled}
                leadingIcon={<SettingsIcon size={16} />}
                trailingIcon={<ChevronRightIcon size={14} />}
              >
                Team settings
              </QuickLink>
            </ThemeScope>
          }
        />
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
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
