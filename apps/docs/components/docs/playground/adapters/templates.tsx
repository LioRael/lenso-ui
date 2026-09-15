"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Button } from "@lenso/ui/button";
import { IconButton } from "@lenso/ui/icon-button";
import { PageHeader } from "@lenso/ui/page-header";
import { Sidebar } from "@lenso/ui/sidebar";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { SettingsPage } from "../../../templates/settings-page";
import type { PlaygroundAdapter, PlaygroundValue } from "../types";
import { glyphStyles, styles } from "./page-layout-template.stylex";

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
  { glyph: "home", id: "home", label: "Overview" },
  { glyph: "issues", id: "issues", label: "Work" },
  { glyph: "agent", id: "agent", label: "Agents" },
] as const satisfies ReadonlyArray<{
  glyph: SidebarGlyphName;
  id: string;
  label: string;
}>;

const teamItems = [
  { glyph: "views", id: "roadmap", label: "Roadmap" },
  { glyph: "project", id: "releases", label: "Releases" },
  { glyph: "template", id: "documents", label: "Documents" },
  { glyph: "members", id: "members", label: "Members" },
] as const;

const applicationPages = {
  dashboard: {
    activeTab: "overview",
    glyph: "home",
    rows: [
      ["Release readiness", "3 blockers resolved", "On track"],
      ["Runtime health", "All regions reporting", "Stable"],
      ["Design system", "Review requested", "12 updates"],
    ],
    tabs: ["Overview", "Activity"],
    title: "Home",
  },
  "data-list": {
    activeTab: "active",
    glyph: "issues",
    rows: [
      ["Improve onboarding", "Product · LS-142", "In progress"],
      ["Audit runtime permissions", "Runtime · LS-138", "Backlog"],
      ["Prepare release notes", "Release · LS-129", "Ready"],
    ],
    tabs: ["Active", "Backlog", "Completed"],
    title: "Issues",
  },
  "data-table": {
    activeTab: "all",
    glyph: "project",
    rows: [
      ["Console", "Lena Ortiz", "Active"],
      ["Agent Harness", "Morgan Chen", "Active"],
      ["Lenso UI", "Leo Southey", "Maintained"],
    ],
    tabs: ["All", "Active", "Archived"],
    title: "Projects",
  },
} as const satisfies Record<
  Exclude<PageLayoutContext, "settings">,
  {
    activeTab: string;
    glyph: SidebarGlyphName;
    rows: ReadonlyArray<readonly [string, string, string]>;
    tabs: readonly string[];
    title: string;
  }
>;

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
  name,
  nested = false,
  xstyle,
}: {
  name: SidebarGlyphName;
  nested?: boolean;
  xstyle?: stylex.StyleXStyles;
}) {
  const strong = ["add", "create", "create-team", "search", "settings-search"].includes(name);
  return (
    <span
      aria-hidden="true"
      {...stylex.props(
        styles.sidebarGlyph,
        nested && styles.nestedGlyph,
        strong && styles.strongGlyph,
        glyphStyles[name],
        xstyle,
      )}
      data-glyph={name}
      data-nested={nested ? "" : undefined}
    >
      {name === "security" && (
        <>
          <span {...stylex.props(styles.securityPart, styles.securityRight)} />
          <span {...stylex.props(styles.securityPart, styles.securityBottom)} />
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

function SidebarNavigationSection({
  action,
  children,
  label,
}: {
  action?: string | undefined;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Sidebar.Section data-page-layout-section={label} xstyle={styles.contextNavigationSection}>
      <Sidebar.SectionHeader xstyle={styles.contextNavigationSectionHeader}>
        <Sidebar.SectionLabel xstyle={styles.contextNavigationSectionLabel}>
          {label}
        </Sidebar.SectionLabel>
        {action && (
          <Sidebar.SectionAction xstyle={styles.contextNavigationSectionAction}>
            <IconButton aria-label={action} size="compact" variant="ghost">
              <SidebarGlyph name="add" />
            </IconButton>
          </Sidebar.SectionAction>
        )}
      </Sidebar.SectionHeader>
      <div {...stylex.props(styles.contextNavigationSectionContent)}>{children}</div>
    </Sidebar.Section>
  );
}

function ApplicationSidebar({
  compact,
  context,
  onOpenChange,
  open,
}: {
  compact: boolean;
  context: Exclude<PageLayoutContext, "settings">;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const initialSelection = context === "data-list" ? "issues" : "home";
  const [selectedItem, setSelectedItem] = React.useState(initialSelection);
  const selectItem = (id: string) => {
    setSelectedItem(id);
    if (compact) onOpenChange(false);
  };

  return (
    <Sidebar.Root
      id="page-layout-sidebar"
      onOpenChange={onOpenChange}
      open={compact ? open : true}
      xstyle={[styles.sidebarRoot, compact && styles.compactSidebarRoot]}
    >
      <Sidebar.Panel
        aria-label="Workspace navigation"
        xstyle={
          compact
            ? [
                styles.contextSidebarPanel,
                styles.compactSidebarPanel,
                open ? styles.openCompactSidebarPanel : styles.closedCompactSidebarPanel,
              ]
            : styles.contextSidebarPanel
        }
      >
        <Sidebar.Header>
          <strong {...stylex.props(styles.contextNavigationTitle)}>TestABl</strong>
          <Sidebar.HeaderSpacer />
          {compact ? (
            <IconButton
              aria-label="Close workspace navigation"
              onClick={() => onOpenChange(false)}
              size="default"
              variant="ghost"
            >
              <SidebarGlyph name="back" />
            </IconButton>
          ) : (
            <IconButton aria-label="Search workspace" size="default" variant="ghost">
              <SidebarGlyph name="search" />
            </IconButton>
          )}
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
                  onClick={() => selectItem(id)}
                  selected={selectedItem === id}
                  xstyle={[
                    styles.contextNavigationItem,
                    selectedItem === id && styles.selectedContextNavigationItem,
                  ]}
                >
                  {label}
                </Sidebar.Item>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>

          <SidebarNavigationSection label="Workspace">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item
                  icon={<SidebarGlyph name="project" />}
                  xstyle={styles.contextNavigationItem}
                >
                  Projects
                </Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item
                  icon={<SidebarGlyph name="views" />}
                  xstyle={styles.contextNavigationItem}
                >
                  Views
                </Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem xstyle={styles.onePixelRowOffset}>
                <Sidebar.Item
                  icon={<SidebarGlyph name="more" />}
                  xstyle={styles.contextNavigationItem}
                >
                  More
                </Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarNavigationSection>

          <SidebarNavigationSection action="Create pinned view" label="Pinned">
            <Sidebar.Menu>
              <Sidebar.MenuItem xstyle={styles.onePixelRowOffset}>
                <Sidebar.Item
                  icon={<SidebarGlyph name="inbox" xstyle={styles.favoriteGlyph} />}
                  xstyle={styles.contextNavigationItem}
                >
                  Release readiness
                </Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarNavigationSection>

          <SidebarNavigationSection action="Create a space" label="Spaces">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item
                  icon={<SidebarGlyph name="team" />}
                  xstyle={styles.contextNavigationItem}
                >
                  Product
                </Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Submenu>
                  {teamItems.map(({ glyph, id, label }) => (
                    <Sidebar.MenuItem key={id}>
                      <Sidebar.Item
                        icon={<SidebarGlyph name={glyph} nested />}
                        nested
                        onClick={() => selectItem(id)}
                        selected={selectedItem === id}
                        xstyle={[
                          styles.contextNavigationItem,
                          selectedItem === id && styles.selectedContextNavigationItem,
                        ]}
                      >
                        {label}
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Submenu>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </SidebarNavigationSection>
        </Sidebar.Content>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

function SettingsSidebar({
  compact,
  onOpenChange,
  open,
}: {
  compact: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
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
    <Sidebar.Root
      id="page-layout-sidebar"
      onOpenChange={onOpenChange}
      open={compact ? open : true}
      xstyle={[styles.sidebarRoot, compact && styles.compactSidebarRoot]}
    >
      <Sidebar.Panel
        aria-label="Settings navigation"
        xstyle={
          compact
            ? [
                styles.contextSidebarPanel,
                styles.settingsSidebarPanel,
                styles.compactSidebarPanel,
                open ? styles.openCompactSidebarPanel : styles.closedCompactSidebarPanel,
              ]
            : [styles.contextSidebarPanel, styles.settingsSidebarPanel]
        }
      >
        <Button
          onClick={() => compact && onOpenChange(false)}
          variant="ghost"
          xstyle={styles.backButton}
        >
          <SidebarGlyph name="back" xstyle={styles.backGlyph} />
          Back to app
        </Button>
        <label {...stylex.props(styles.settingsSearch)}>
          <SidebarGlyph name="settings-search" xstyle={styles.settingsSearchIcon} />
          <input
            {...stylex.props(styles.settingsSearchInput)}
            aria-label="Search settings"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search…"
            type="search"
            value={query}
          />
        </label>
        <nav aria-label="Settings sections" {...stylex.props(styles.settingsNavigation)}>
          {visibleGroups.map((group, index) => (
            <section
              {...stylex.props(styles.settingsGroup, index === 0 && styles.firstSettingsGroup)}
              key={group.label}
            >
              <Sidebar.SectionLabel xstyle={styles.settingsGroupLabel}>
                {group.label}
              </Sidebar.SectionLabel>
              <Sidebar.Menu xstyle={styles.settingsMenu}>
                {group.items.map(([id, label, glyph]) => (
                  <Sidebar.MenuItem key={id}>
                    <Sidebar.Item
                      icon={<SidebarGlyph name={glyph} />}
                      onClick={() => setSelectedItem(id)}
                      selected={selectedItem === id}
                      xstyle={[
                        styles.contextNavigationItem,
                        selectedItem === id && styles.selectedContextNavigationItem,
                      ]}
                    >
                      {label}
                    </Sidebar.Item>
                  </Sidebar.MenuItem>
                ))}
              </Sidebar.Menu>
            </section>
          ))}
          {visibleGroups.length === 0 && (
            <p aria-live="polite" {...stylex.props(styles.settingsEmptyState)}>
              No settings found
            </p>
          )}
        </nav>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

function PrimaryRail({ compact, context }: { compact: boolean; context: PageLayoutContext }) {
  const activeArea =
    context === "settings"
      ? "preferences"
      : context === "data-table"
        ? "projects"
        : context === "data-list"
          ? "work"
          : "overview";
  const areas = [
    ["overview", "Overview", "home"],
    ["work", "Work", "issues"],
    ["projects", "Projects", "project"],
    ["agents", "Agents", "agent"],
  ] as const satisfies ReadonlyArray<readonly [string, string, SidebarGlyphName]>;

  return (
    <Sidebar.Root defaultOpen id="page-layout-primary-rail" xstyle={styles.primaryRailRoot}>
      <Sidebar.Panel aria-label="Global navigation" render={<nav />} xstyle={styles.primaryRail}>
        {compact ? (
          <Sidebar.Trigger
            aria-label="Open workspace navigation"
            render={<button {...stylex.props(styles.railWorkspace)} type="button" />}
            targetId="page-layout-sidebar"
          >
            L
          </Sidebar.Trigger>
        ) : (
          <button
            aria-label="Open workspace switcher"
            {...stylex.props(styles.railWorkspace)}
            type="button"
          >
            L
          </button>
        )}
        <div {...stylex.props(styles.railAreas)}>
          {areas.map(([id, label, glyph]) => (
            <IconButton
              aria-label={label}
              key={id}
              size="default"
              variant="ghost"
              xstyle={[styles.railButton, activeArea === id && styles.activeRailButton]}
            >
              <SidebarGlyph name={glyph} xstyle={styles.railGlyph} />
            </IconButton>
          ))}
        </div>
        <div {...stylex.props(styles.railFooter)}>
          <IconButton
            aria-label="Preferences"
            size="default"
            variant="ghost"
            xstyle={[styles.railButton, activeArea === "preferences" && styles.activeRailButton]}
          >
            <SidebarGlyph name="preferences" xstyle={styles.railGlyph} />
          </IconButton>
          <IconButton aria-label="Help" size="default" variant="ghost" xstyle={styles.railButton}>
            <SidebarGlyph name="help" xstyle={styles.railGlyph} />
          </IconButton>
          <button aria-label="Open profile" {...stylex.props(styles.railProfile)} type="button">
            LS
          </button>
        </div>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}

function SelectionContext({ context }: { context: "dashboard" | "data-list" }) {
  const issueContext = context === "data-list";
  const status = issueContext ? "In progress" : "On track";

  return (
    <aside aria-label="Selection context" {...stylex.props(styles.contextPanel)}>
      <div {...stylex.props(styles.contextHeader)}>
        <div {...stylex.props(styles.contextHeadingRow)}>
          <h2 {...stylex.props(styles.contextTitle)}>
            {issueContext ? "Improve onboarding" : "Release readiness"}
          </h2>
          <span {...stylex.props(styles.contextStatus)}>{status}</span>
        </div>
        <p {...stylex.props(styles.contextDescription)}>
          {issueContext
            ? "Clarify the first-run path without adding another configuration step."
            : "Ready for final review across product and runtime."}
        </p>
      </div>
      <div {...stylex.props(styles.contextDetailsSection)}>
        <p {...stylex.props(styles.contextSectionLabel)}>Details</p>
        <dl {...stylex.props(styles.contextDetails)}>
          <div {...stylex.props(styles.contextDetail)}>
            <dt {...stylex.props(styles.contextTerm)}>{issueContext ? "Team" : "Owner"}</dt>
            <dd {...stylex.props(styles.contextValue)}>{issueContext ? "Product" : "TestABl"}</dd>
          </div>
          <div {...stylex.props(styles.contextDetail)}>
            <dt {...stylex.props(styles.contextTerm)}>{issueContext ? "ID" : "Stage"}</dt>
            <dd {...stylex.props(styles.contextValue)}>
              {issueContext ? "LS-142" : "Final review"}
            </dd>
          </div>
          <div {...stylex.props(styles.contextDetail)}>
            <dt {...stylex.props(styles.contextTerm)}>Updated</dt>
            <dd {...stylex.props(styles.contextValue)}>Today</dd>
          </div>
        </dl>
      </div>
      <div {...stylex.props(styles.contextFooter)}>
        <Button variant="ghost" xstyle={styles.contextAction}>
          Open details
        </Button>
      </div>
    </aside>
  );
}

function WorkList({ compact, context }: { compact: boolean; context: "dashboard" | "data-list" }) {
  const page = applicationPages[context];

  return (
    <div {...stylex.props(styles.applicationBody, compact && styles.compactApplicationBody)}>
      <section aria-label={`${page.title} items`} {...stylex.props(styles.workArea)}>
        <div {...stylex.props(styles.workRows)}>
          {page.rows.map(([label, detail, status], index) => (
            <React.Fragment key={label}>
              <button
                aria-pressed={index === 0}
                {...stylex.props(styles.workRow, index === 0 && styles.selectedWorkRow)}
                type="button"
              >
                <span aria-hidden="true" {...stylex.props(styles.workRowMarker)} />
                <span {...stylex.props(styles.workRowCopy)}>
                  <span {...stylex.props(styles.workRowLabel)}>{label}</span>
                  <span {...stylex.props(styles.workRowMeta)}>{detail}</span>
                </span>
                <span {...stylex.props(styles.workRowStatus)}>{status}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </section>
      {!compact && <SelectionContext context={context} />}
    </div>
  );
}

function ProjectTable({ compact }: { compact: boolean }) {
  const page = applicationPages["data-table"];

  return (
    <div
      {...stylex.props(styles.applicationBodyWide, compact && styles.compactApplicationBodyWide)}
    >
      <section aria-label="Projects" {...stylex.props(styles.workArea)}>
        <table
          aria-label="Projects"
          {...stylex.props(styles.dataTable, compact && styles.compactDataTable)}
        >
          <thead>
            <tr {...stylex.props(styles.dataTableHeader)}>
              <th {...stylex.props(styles.dataTableCell)} scope="col">
                Project
              </th>
              <th {...stylex.props(styles.dataTableCell)} scope="col">
                Owner
              </th>
              <th {...stylex.props(styles.dataTableCell)} scope="col">
                Status
              </th>
              <th {...stylex.props(styles.dataTableCell)} scope="col">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map(([label, owner, status], index) => (
              <tr key={label} {...stylex.props(styles.dataTableRow)}>
                <td {...stylex.props(styles.dataTableCell, styles.dataTableProject)}>
                  <span aria-hidden="true" {...stylex.props(styles.projectMark)}>
                    {label.slice(0, 1)}
                  </span>
                  {label}
                </td>
                <td {...stylex.props(styles.dataTableCell, styles.dataTableSecondary)}>{owner}</td>
                <td {...stylex.props(styles.dataTableCell)}>
                  <span {...stylex.props(styles.tableStatus)}>{status}</span>
                </td>
                <td {...stylex.props(styles.dataTableCell, styles.dataTableSecondary)}>
                  {index === 0 ? "Today" : `${index + 1}d ago`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ApplicationMain({
  compact,
  context,
}: {
  compact: boolean;
  context: Exclude<PageLayoutContext, "settings">;
}) {
  const page = applicationPages[context];

  return (
    <main
      aria-label={`${page.title} content`}
      {...stylex.props(styles.main, compact && styles.compactMain)}
    >
      <PageHeader.Root variant="team" xstyle={styles.applicationHeader}>
        <PageHeader.TabsRoot defaultValue={page.activeTab}>
          <PageHeader.Row>
            <PageHeader.Leading>
              <SidebarGlyph name={page.glyph} xstyle={styles.pageHeaderGlyph} />
            </PageHeader.Leading>
            <PageHeader.Title>{page.title}</PageHeader.Title>
            <PageHeader.Spacer />
            <PageHeader.Actions>
              <Button variant="secondary" xstyle={compact && styles.compactHidden}>
                Filter
              </Button>
              <Button>New</Button>
            </PageHeader.Actions>
          </PageHeader.Row>
          <PageHeader.TabsRow xstyle={compact && styles.compactTabsRow}>
            <PageHeader.TabsList aria-label={`${page.title} views`}>
              {page.tabs.map((tab) => (
                <React.Fragment key={tab}>
                  <PageHeader.Tab value={tab.toLocaleLowerCase()}>{tab}</PageHeader.Tab>
                </React.Fragment>
              ))}
            </PageHeader.TabsList>
          </PageHeader.TabsRow>
        </PageHeader.TabsRoot>
      </PageHeader.Root>
      {context === "data-table" ? (
        <ProjectTable compact={compact} />
      ) : (
        <WorkList compact={compact} context={context} />
      )}
    </main>
  );
}

function PageLayoutPreview({ context }: { context: PageLayoutContext }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [compact, setCompact] = React.useState(false);
  const [navigationOpen, setNavigationOpen] = React.useState(false);
  const [scale, setScale] = React.useState(1);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const { height, width } = container.getBoundingClientRect();
      const nextCompact = width < 620;
      const designWidth = nextCompact ? 390 : 1280;
      const viewportWidth = nextCompact
        ? Math.min(width, height * (390 / 720))
        : Math.min(width, 846.222);
      const viewportHeight = nextCompact
        ? Math.min(height, width * (720 / 390))
        : viewportWidth * (720 / 1280);

      setCompact(nextCompact);
      setScale(Math.min(viewportWidth / designWidth, viewportHeight / 720));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    updateScale();
    return () => observer.disconnect();
  }, []);

  return (
    <div {...stylex.props(styles.previewContainer)} ref={containerRef}>
      <div {...stylex.props(styles.previewViewport, compact && styles.compactPreviewViewport)}>
        <div
          {...stylex.props(styles.scaleLayer, compact && styles.compactScaleLayer)}
          data-page-layout-scale-layer=""
          style={{ transform: `scale(${scale})` }}
        >
          <Sidebar.Group
            data-compact={compact ? "" : undefined}
            data-page-layout-shell=""
            xstyle={[styles.shell, compact && styles.compactShell]}
          >
            <div
              {...stylex.props(styles.navigationRegion, compact && styles.compactNavigationRegion)}
            >
              <PrimaryRail compact={compact} context={context} />
              {context === "settings" ? (
                <SettingsSidebar
                  compact={compact}
                  onOpenChange={setNavigationOpen}
                  open={navigationOpen}
                />
              ) : (
                <ApplicationSidebar
                  compact={compact}
                  context={context}
                  key={context}
                  onOpenChange={setNavigationOpen}
                  open={navigationOpen}
                />
              )}
            </div>
            {compact && (
              <button
                aria-hidden={!navigationOpen}
                aria-label="Close workspace navigation"
                {...stylex.props(
                  styles.compactNavigationScrim,
                  !navigationOpen && styles.closedCompactNavigationScrim,
                )}
                disabled={!navigationOpen}
                onClick={() => setNavigationOpen(false)}
                type="button"
              />
            )}
            {context === "settings" ? (
              <SettingsPage
                idPrefix="page-layout-settings-preview"
                xstyle={[styles.main, compact && styles.compactMain]}
              />
            ) : (
              <ApplicationMain compact={compact} context={context} />
            )}
            <footer aria-label="Application utilities" {...stylex.props(styles.utilityBar)}>
              <Button variant="ghost" xstyle={styles.utilityButton}>
                <SidebarGlyph name="agent" nested />
                Agent
              </Button>
              <IconButton
                aria-label="Open chat history"
                xstyle={styles.chatHistoryButton}
                size="default"
                variant="ghost"
              >
                <SidebarGlyph name="chat-history" />
              </IconButton>
            </footer>
          </Sidebar.Group>
        </div>
      </div>
    </div>
  );
}

export const pageLayoutAdapter: PlaygroundAdapter = ({ pageTheme, theme, values }) => {
  const context = pageLayoutContext(values);
  return (
    <ThemeScope
      theme={theme}
      xstyle={
        [
          styles.stage,
          pageTheme === "light" ? styles.lightStage : styles.darkStage,
        ] as unknown as stylex.StyleXStyles
      }
    >
      <PageLayoutPreview context={context} />
    </ThemeScope>
  );
};
