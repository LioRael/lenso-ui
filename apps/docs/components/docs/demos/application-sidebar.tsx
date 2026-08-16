"use client";

import * as React from "react";
import {
  BotIcon,
  BoxIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  InboxIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";

import { Disclosure } from "@lenso/ui/disclosure";
import { IconButton } from "@lenso/ui/icon-button";
import { Sidebar } from "@lenso/ui/sidebar";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { DocsShell } from "../shell";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

type StageTheme = "Dark" | "Light" | "System";

const codeExample = `import { Sidebar } from "@lenso/ui/sidebar"

<Sidebar.Root defaultOpen>
  <Sidebar.Panel>
    <Sidebar.Header>...</Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Item render={<Link href="/inbox" />}>Inbox</Sidebar.Item>
    </Sidebar.Content>
  </Sidebar.Panel>
</Sidebar.Root>`;

const iconProps = { size: 16, strokeWidth: 1.5 };

function Section({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Disclosure.Root defaultValue={[label]}>
      <Disclosure.Item value={label}>
        <Sidebar.SectionHeader>
          <Disclosure.Header>
            <Disclosure.Trigger>
              {label}
              <Disclosure.Icon />
            </Disclosure.Trigger>
          </Disclosure.Header>
          <Sidebar.SectionAction>
            <IconButton aria-label={`Add to ${label}`} size="compact" variant="ghost">
              <PlusIcon />
            </IconButton>
          </Sidebar.SectionAction>
        </Sidebar.SectionHeader>
        <Sidebar.SectionContent>{children}</Sidebar.SectionContent>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

type SidebarSelection =
  | "inbox"
  | "my-issues"
  | "agent"
  | "workspace-projects"
  | "workspace-views"
  | "team"
  | "home"
  | "issues"
  | "team-projects";

function SidebarDemo() {
  const [selectedItem, setSelectedItem] = React.useState<SidebarSelection>("home");

  return (
    <Sidebar.Group style={{ height: 720 }}>
      <Sidebar.Root defaultOpen id="docs-sidebar">
        <Sidebar.Panel>
          <Sidebar.Header>
            <Sidebar.Workspace icon="TE" indicator={<ChevronDownIcon size={10} />}>
              testABl
            </Sidebar.Workspace>
            <Sidebar.HeaderSpacer />
            <IconButton aria-label="Search workspace" variant="ghost">
              <SearchIcon />
            </IconButton>
            <IconButton aria-label="Create new issue" variant="secondary">
              <PlusIcon />
            </IconButton>
          </Sidebar.Header>
          <Sidebar.Content>
            <Section label="Navigation">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<InboxIcon {...iconProps} />}
                    onClick={() => setSelectedItem("inbox")}
                    selected={selectedItem === "inbox"}
                  >
                    Inbox
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<LayersIcon {...iconProps} />}
                    onClick={() => setSelectedItem("my-issues")}
                    selected={selectedItem === "my-issues"}
                  >
                    My issues
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BotIcon {...iconProps} />}
                    onClick={() => setSelectedItem("agent")}
                    selected={selectedItem === "agent"}
                  >
                    Agent
                  </Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Section>
            <Section label="Workspace">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BoxIcon {...iconProps} />}
                    onClick={() => setSelectedItem("workspace-projects")}
                    selected={selectedItem === "workspace-projects"}
                  >
                    Projects
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<LayersIcon {...iconProps} />}
                    onClick={() => setSelectedItem("workspace-views")}
                    selected={selectedItem === "workspace-views"}
                  >
                    Views
                  </Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Section>
            <Section label="Your teams">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BoxIcon {...iconProps} />}
                    onClick={() => setSelectedItem("team")}
                    selected={selectedItem === "team"}
                  >
                    TestABl
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Submenu>
                    <Sidebar.MenuItem>
                      <Sidebar.Item
                        icon={<BoxIcon size={14} />}
                        nested
                        onClick={() => setSelectedItem("home")}
                        selected={selectedItem === "home"}
                      >
                        Home
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item
                        icon={<LayersIcon size={14} />}
                        nested
                        onClick={() => setSelectedItem("issues")}
                        selected={selectedItem === "issues"}
                      >
                        Issues
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item
                        icon={<BoxIcon size={14} />}
                        nested
                        onClick={() => setSelectedItem("team-projects")}
                        selected={selectedItem === "team-projects"}
                      >
                        Projects
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                  </Sidebar.Submenu>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Section>
          </Sidebar.Content>
          <Sidebar.Footer>
            <IconButton aria-label="Help" size="compact" variant="ghost">
              <CircleHelpIcon />
            </IconButton>
          </Sidebar.Footer>
        </Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>
  );
}

export function SidebarDocumentation() {
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Sidebar"]}
      current="application-sidebar"
      theme={pageTheme}
    >
      <div className="button-docs-content sidebar-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">PRODUCT COMPONENT · NAVIGATION</p>
          <h1>Sidebar</h1>
          <p className="button-description">
            A composable application rail for workspace navigation, nested teams, settings, and
            two-sided layouts.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation ready</span>
          </div>
        </section>
        <LivePlayground
          bodyClassName="sidebar-playground-body"
          controls={
            <PlaygroundControls
              example="default"
              exampleLabel="Example · App"
              name="Sidebar"
              onExampleChange={() => {}}
            >
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
          description="Inspect the canonical 244px App sidebar, disclosure groups, and theme parity."
          preview={
            <ThemeScope className="stage-canvas sidebar-stage-canvas" theme={resolvedTheme}>
              <SidebarDemo />
            </ThemeScope>
          }
          sectionClassName="sidebar-playground"
          stageClassName="sidebar-rendered-stage"
        />
        <section className="button-guidance select-guidance">
          <article>
            <h2>Composition</h2>
            <ul>
              <li>
                Use Root and Panel for behavior, then compose sections and navigation at product
                level.
              </li>
              <li>
                Item supports Base UI render composition for Next.js Link or any custom element.
              </li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Use landmarks and descriptive labels for every icon-only action.</li>
              <li>Escape closes a panel and restores focus to its trigger.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              Headless state stays in @lenso/primitives; the Figma-matched visual layer is exported
              from @lenso/ui.
            </p>
          </div>
          <CodeBlock code={codeExample} />
        </section>
      </div>
    </DocsShell>
  );
}
