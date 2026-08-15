"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Tabs } from "@lenso/ui/tabs";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

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
  const pageTheme = useDocsPageTheme();
  const [selected, setSelected] = React.useState<TabValue>("overview");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");

  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");

  return (
    <ComponentPage
      description="A compact peer-view switcher with keyboard navigation and consumer-owned panels."
      eyebrow="Foundation component · Navigation"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Tabs"
      slug="tabs"
    >
      <LivePlayground
        actions={
          <>
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
          </>
        }
        controls={
          <PlaygroundControls
            example="default"
            exampleLabel="Example · Default"
            name="Tabs"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Selected"
              onValueChange={(value) => setSelected(value as TabValue)}
              options={[
                { label: "Overview", value: "overview" },
                { label: "Documents", value: "documents" },
                { label: "Members", value: "members" },
              ]}
              value={selected}
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
        description="Compare selection, keyboard focus, content switching, and theme parity."
        preview={
          <ThemeScope className="stage-canvas tabs-stage" theme={resolvedTheme}>
            <Tabs.Root onValueChange={(value) => setSelected(value as TabValue)} value={selected}>
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
        }
      />
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
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
