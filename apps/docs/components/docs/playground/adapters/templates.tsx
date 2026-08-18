"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { Disclosure } from "@lenso/ui/disclosure";
import { IconButton } from "@lenso/ui/icon-button";
import { Sidebar } from "@lenso/ui/sidebar";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter, PlaygroundValue } from "../types";
import styles from "./page-layout-template.module.css";

const pageLayoutContexts = ["dashboard", "data-table", "data-list", "settings"] as const;
type PageLayoutContext = (typeof pageLayoutContexts)[number];

type SidebarGlyphName =
  | "add"
  | "agent"
  | "back"
  | "billing"
  | "chat-history"
  | "code-reviews"
  | "connected"
  | "create"
  | "create-team"
  | "help"
  | "home"
  | "inbox"
  | "issues"
  | "label"
  | "members"
  | "more"
  | "notifications"
  | "preferences"
  | "profile"
  | "project"
  | "search"
  | "security"
  | "settings-search"
  | "sla"
  | "team"
  | "template"
  | "views"
  | "workspace-chevron";

const topNavigationItems = [
  { glyph: "inbox", id: "inbox", label: "Inbox" },
  { glyph: "issues", id: "my-issues", label: "My issues" },
  { glyph: "agent", id: "agent", label: "Agent" },
] as const satisfies ReadonlyArray<{
  glyph: SidebarGlyphName;
  id: string;
  label: string;
}>;

const teamItems = [
  { glyph: "home", id: "home", label: "Home" },
  { glyph: "issues", id: "issues", label: "Issues" },
  { glyph: "project", id: "projects", label: "Projects" },
  { glyph: "views", id: "views", label: "Views" },
] as const;

const settingsGroups = [
  {
    items: [
      ["preferences", "Preferences", "preferences"],
      ["profile", "Profile", "profile"],
      ["notifications", "Notifications", "notifications"],
      ["code-reviews", "Code & reviews", "code-reviews"],
      ["security", "Security & access", "security"],
      ["connected", "Connected accounts", "connected"],
      ["agent-personalization", "Agent personalization", "agent"],
    ],
    label: "Personal",
  },
  {
    items: [
      ["issue-labels", "Labels", "label"],
      ["issue-templates", "Templates", "template"],
      ["slas", "SLAs", "sla"],
    ],
    label: "Issues",
  },
  {
    items: [
      ["project-labels", "Labels", "label"],
      ["project-templates", "Templates", "template"],
      ["statuses", "Statuses", "sla"],
      ["updates", "Updates", "views"],
    ],
    label: "Projects",
  },
  {
    items: [
      ["ai-agents", "AI & Agents", "agent"],
      ["initiatives", "Initiatives", "project"],
      ["documents", "Documents", "template"],
      ["customer-requests", "Customer requests", "inbox"],
      ["releases", "Releases", "project"],
      ["pulse", "Pulse", "views"],
      ["asks", "Asks", "inbox"],
      ["emojis", "Emojis", "more"],
      ["integrations", "Integrations", "connected"],
    ],
    label: "Features",
  },
  {
    items: [
      ["workspace", "Workspace", "home"],
      ["teams", "Teams", "team"],
      ["members", "Members", "members"],
      ["administration-security", "Security", "security"],
      ["api", "API", "code-reviews"],
      ["applications", "Applications", "connected"],
      ["billing", "Billing", "billing"],
      ["usage-limits", "Usage & limits", "views"],
      ["import-export", "Import & export", "connected"],
    ],
    label: "Administration",
  },
  {
    items: [
      ["testabl", "TestABl", "team"],
      ["create-team", "Create a team", "create-team"],
    ],
    label: "Your teams",
  },
] as const satisfies ReadonlyArray<{
  items: ReadonlyArray<readonly [string, string, SidebarGlyphName]>;
  label: string;
}>;

function SidebarGlyph({
  className,
  name,
  nested = false,
}: {
  className?: string | undefined;
  name: SidebarGlyphName;
  nested?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={[styles.sidebarGlyph, className].filter(Boolean).join(" ")}
      data-glyph={name}
      data-nested={nested ? "" : undefined}
    >
      {name === "security" && (
        <>
          <span className={styles.securityRight} />
          <span className={styles.securityBottom} />
        </>
      )}
    </span>
  );
}

function pageLayoutContext(values: Readonly<Record<string, PlaygroundValue>>): PageLayoutContext {
  const value = values.context;
  return typeof value === "string" && pageLayoutContexts.includes(value as PageLayoutContext)
    ? (value as PageLayoutContext)
    : "dashboard";
}

function SidebarDisclosureSection({
  action,
  children,
  label,
}: {
  action?: string | undefined;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Disclosure.Root defaultValue={[label]}>
      <Disclosure.Item value={label}>
        <Sidebar.Section data-page-layout-section={label}>
          <Sidebar.SectionHeader>
            <Disclosure.Header>
              <Sidebar.SectionTrigger>
                {label}
                <Disclosure.Icon />
              </Sidebar.SectionTrigger>
            </Disclosure.Header>
            {action && (
              <Sidebar.SectionAction>
                <IconButton aria-label={action} size="compact" variant="ghost">
                  <SidebarGlyph name="add" />
                </IconButton>
              </Sidebar.SectionAction>
            )}
          </Sidebar.SectionHeader>
          <Sidebar.SectionContent>{children}</Sidebar.SectionContent>
        </Sidebar.Section>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

function ApplicationSidebar({ context }: { context: Exclude<PageLayoutContext, "settings"> }) {
  const initialSelection = context === "data-list" ? "issues" : "home";
  const [selectedItem, setSelectedItem] = React.useState(initialSelection);

  return (
    <Sidebar.Root className={styles.sidebarRoot} defaultOpen id="page-layout-sidebar">
      <Sidebar.Panel aria-label="Workspace navigation">
        <Sidebar.Header>
          <Sidebar.Workspace icon="TE" indicator={<SidebarGlyph name="workspace-chevron" />}>
            testABl
          </Sidebar.Workspace>
          <Sidebar.HeaderSpacer />
          <IconButton aria-label="Search workspace" size="default" variant="ghost">
            <SidebarGlyph name="search" />
          </IconButton>
          <IconButton aria-label="Create new issue" size="default" variant="secondary">
            <SidebarGlyph name="create" />
          </IconButton>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Menu>
            {topNavigationItems.map(({ glyph, id, label }) => (
              <Sidebar.MenuItem key={id}>
                <Sidebar.Item
                  icon={<SidebarGlyph name={glyph} />}
                  onClick={() => setSelectedItem(id)}
                  selected={selectedItem === id}
                >
                  {label}
                </Sidebar.Item>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>

          <SidebarDisclosureSection label="Workspace">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<SidebarGlyph name="project" />}>Projects</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<SidebarGlyph name="views" />}>Views</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem className={styles.onePixelRowOffset}>
                <Sidebar.Item icon={<SidebarGlyph name="more" />}>More</Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarDisclosureSection>

          <SidebarDisclosureSection action="Create new folder for favorites" label="Favorites">
            <Sidebar.Menu>
              <Sidebar.MenuItem className={styles.onePixelRowOffset}>
                <Sidebar.Item icon={<SidebarGlyph className={styles.favoriteGlyph} name="inbox" />}>
                  Active issues
                </Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarDisclosureSection>

          <SidebarDisclosureSection action="Join a team" label="Your teams">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<SidebarGlyph name="team" />}>TestABl</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Submenu>
                  {teamItems.map(({ glyph, id, label }) => (
                    <Sidebar.MenuItem key={id}>
                      <Sidebar.Item
                        icon={<SidebarGlyph name={glyph} nested />}
                        nested
                        onClick={() => setSelectedItem(id)}
                        selected={selectedItem === id}
                      >
                        {label}
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Submenu>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarDisclosureSection>

          <SidebarDisclosureSection label="Try">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<SidebarGlyph name="project" />}>Import issues</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem className={styles.onePixelRowOffset}>
                <Sidebar.Item icon={<SidebarGlyph name="agent" />}>Invite people</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem className={styles.onePixelRowOffset}>
                <Sidebar.Item icon={<SidebarGlyph name="views" />}>Connect GitHub</Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarDisclosureSection>
        </Sidebar.Content>
        <Sidebar.Footer>
          <IconButton aria-label="Help" size="compact" variant="ghost">
            <SidebarGlyph name="help" />
          </IconButton>
        </Sidebar.Footer>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

function SettingsSidebar() {
  const [query, setQuery] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState("preferences");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGroups = settingsGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(([, label]) => label.toLocaleLowerCase().includes(normalizedQuery)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar.Root className={styles.sidebarRoot} defaultOpen id="page-layout-sidebar">
      <Sidebar.Panel aria-label="Settings navigation" className={styles.settingsSidebarPanel}>
        <Button className={styles.backButton} variant="ghost">
          <SidebarGlyph className={styles.backGlyph} name="back" />
          Back to app
        </Button>
        <label className={styles.settingsSearch}>
          <SidebarGlyph name="settings-search" />
          <input
            aria-label="Search settings"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search…"
            type="search"
            value={query}
          />
        </label>
        <nav aria-label="Settings sections" className={styles.settingsNavigation}>
          {visibleGroups.map((group) => (
            <section className={styles.settingsGroup} key={group.label}>
              <Sidebar.SectionLabel className={styles.settingsGroupLabel}>
                {group.label}
              </Sidebar.SectionLabel>
              <Sidebar.Menu>
                {group.items.map(([id, label, glyph]) => (
                  <Sidebar.MenuItem key={id}>
                    <Sidebar.Item
                      icon={<SidebarGlyph name={glyph} />}
                      onClick={() => setSelectedItem(id)}
                      selected={selectedItem === id}
                    >
                      {label}
                    </Sidebar.Item>
                  </Sidebar.MenuItem>
                ))}
              </Sidebar.Menu>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <p aria-live="polite" className={styles.settingsEmptyState}>
              No settings found
            </p>
          )}
        </nav>
        <IconButton
          aria-label="Help"
          className={styles.settingsHelp}
          size="compact"
          variant="ghost"
        >
          <SidebarGlyph name="help" />
        </IconButton>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

function PageLayoutPreview({ context }: { context: PageLayoutContext }) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const { height, width } = viewport.getBoundingClientRect();
      setScale(Math.min(width / 1280, height / 720));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    updateScale();
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.previewViewport} ref={viewportRef}>
      <div
        className={styles.scaleLayer}
        data-page-layout-scale-layer=""
        style={{ transform: `scale(${scale})` }}
      >
        <Sidebar.Group className={styles.shell} data-page-layout-shell="">
          {context === "settings" ? (
            <SettingsSidebar />
          ) : (
            <ApplicationSidebar context={context} key={context} />
          )}
          <main aria-label="Application content" className={styles.main} />
          <footer aria-label="Application utilities" className={styles.utilityBar}>
            <Button className={styles.utilityButton} variant="ghost">
              <SidebarGlyph name="agent" nested />
              Agent
            </Button>
            <IconButton
              aria-label="Open chat history"
              className={styles.chatHistoryButton}
              size="default"
              variant="ghost"
            >
              <SidebarGlyph name="chat-history" />
            </IconButton>
          </footer>
        </Sidebar.Group>
      </div>
    </div>
  );
}

export const pageLayoutAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const context = pageLayoutContext(values);
  return (
    <ThemeScope className={`stage-canvas ${styles.stage}`} theme={theme}>
      <PageLayoutPreview context={context} />
    </ThemeScope>
  );
};
