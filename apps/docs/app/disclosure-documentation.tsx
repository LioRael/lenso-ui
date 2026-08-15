"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Disclosure } from "@lenso/ui/disclosure";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "./components/docs/code-block";
import { DocsShell } from "./docs-shell";
import { LivePlayground } from "./components/docs/live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "./components/docs/playground-controls";
import { useDocsPageTheme } from "./use-docs-page-theme";

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
        <Disclosure.Panel layout="list">
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
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
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
        <LivePlayground
          actions={
            <>
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
            </>
          }
          controls={
            <PlaygroundControls
              example="default"
              exampleLabel="Example · Group"
              name="Disclosure"
              onExampleChange={() => {}}
            >
              <PlaygroundSelectControl
                label="Multiple"
                onValueChange={(value) => setMultiple(value === "True")}
                options={[
                  { label: "False", value: "False" },
                  { label: "True", value: "True" },
                ]}
                value={multiple ? "True" : "False"}
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
          description="Check single or multiple expansion, keyboard behavior, animation, and theme parity."
          preview={
            <ThemeScope className="stage-canvas" theme={resolvedTheme}>
              <DisclosureDemo multiple={multiple} />
            </ThemeScope>
          }
        />
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
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
