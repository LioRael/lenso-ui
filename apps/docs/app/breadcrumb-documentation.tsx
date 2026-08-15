"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

type Example = "basic" | "external" | "overflow" | "team";
type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import Link from "next/link"
import { Breadcrumb } from "@lenso/ui/breadcrumb"

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link render={<Link href="/workspace" />}>Workspace</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Issues</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>`;

function TeamIcon() {
  return (
    <svg aria-hidden="true" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M1.327 2.625h9.1l1.2 4.35c.22.82-.4 1.65-1.25 1.65a1.3 1.3 0 0 1-1.3-1.3 1.3 1.3 0 0 1-2.6 0 1.3 1.3 0 0 1-2.6 0 1.3 1.3 0 0 1-2.6 0c-.85 0-1.47-.83-1.25-1.65l1.3-4.35Z"
        fill="currentColor"
        transform="translate(1.2)"
      />
      <path
        d="M0 0h8.6v3.7H0Zm3.1 1.15V3.7h2.4V1.15Z"
        fill="currentColor"
        fillRule="evenodd"
        transform="translate(2.7 8.14)"
      />
    </svg>
  );
}

function BreadcrumbDemo({ example }: { example: Example }) {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link render={<Link href="#workspace" />}>
            {example === "external" && (
              <Breadcrumb.Icon>
                <ArrowUpRightIcon size={14} />
              </Breadcrumb.Icon>
            )}
            {example === "team" && (
              <Breadcrumb.Icon>
                <TeamIcon />
              </Breadcrumb.Icon>
            )}
            {example === "external" ? "Project" : example === "team" ? "TestABI" : "Workspace"}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {example !== "team" && (
          <>
            <Breadcrumb.Item>
              {example === "overflow" ? (
                <Breadcrumb.Ellipsis />
              ) : (
                <Breadcrumb.Link render={<Link href="#project" />}>Workspace</Breadcrumb.Link>
              )}
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
          </>
        )}
        <Breadcrumb.Item>
          <Breadcrumb.Page>{example === "team" ? "Issues" : "Workspace"}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}

export function BreadcrumbDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [example, setExample] = React.useState<Example>("basic");
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Breadcrumb"]}
      current="breadcrumb"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · NAVIGATION</p>
          <h1>Breadcrumb</h1>
          <p className="button-description">
            A compact location trail with composable links, separators, overflow, and icons.
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
                  setExample("basic");
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
              name="Breadcrumb"
              onExampleChange={() => {}}
            >
              <PlaygroundSelectControl
                label="Example"
                onValueChange={(value) => setExample(value as Example)}
                options={[
                  { label: "Basic", value: "basic" },
                  { label: "Overflow", value: "overflow" },
                  { label: "External", value: "external" },
                  { label: "Team", value: "team" },
                ]}
                value={example}
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
          description="Check composition, link rendering, overflow, and theme parity."
          preview={
            <ThemeScope className="stage-canvas" theme={resolvedTheme}>
              <BreadcrumbDemo example={example} />
            </ThemeScope>
          }
        />
        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Keep trails short; collapse intermediate locations when space is constrained.</li>
              <li>
                Render router links through <code>render</code> so navigation remains native.
              </li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>
                The root exposes a named navigation landmark and the current page is announced.
              </li>
              <li>Separators are decorative and excluded from the accessibility tree.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Semantic list markup with Base UI-powered interactive parts and replaceable icons.
            </p>
          </div>
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
