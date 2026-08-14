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

import { DocsShell } from "./docs-shell";

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
        <Disclosure.Panel>{children}</Disclosure.Panel>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

function SidebarDemo() {
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
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<InboxIcon {...iconProps} />}>Inbox</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<LayersIcon {...iconProps} />}>My issues</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<BotIcon {...iconProps} />}>Agent</Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
            <Section label="Workspace">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon {...iconProps} />}>Projects</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<LayersIcon {...iconProps} />}>Views</Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Section>
            <Section label="Your teams">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon {...iconProps} />}>TestABl</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Submenu>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<BoxIcon size={14} />} nested selected>
                        Home
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<LayersIcon size={14} />} nested>
                        Issues
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<BoxIcon size={14} />} nested>
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
      breadcrumbs={["Components", "Sidebar"]}
      current="sidebar"
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
        <section className="button-playground sidebar-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>Inspect the canonical 244px App sidebar, disclosure groups, and theme parity.</p>
            </div>
          </div>
          <div className="playground-body sidebar-playground-body">
            <article className="rendered-stage sidebar-rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas sidebar-stage-canvas" theme={resolvedTheme}>
                <SidebarDemo />
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Sidebar</strong>
                <button type="button">
                  Example · App <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
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
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
