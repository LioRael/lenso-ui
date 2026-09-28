"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  FolderIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  PanelLeftIcon,
  PlusIcon,
  PuzzleIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";

import { ThemeScope } from "@lenso/ui/theme-scope";

import {
  ConsoleProfilePage,
  ConsoleSidebarItem,
  ConsoleSidebarSection,
  ConsoleWorkspace,
  type ConsoleTabId,
  type ConsoleWorkspaceId,
} from "../../../templates/console-workspace";
import type { PlaygroundAdapter } from "../types";
import { styles } from "./console-workspace-template.stylex";

const firstTab: Record<ConsoleWorkspaceId, ConsoleTabId> = {
  agent: "chat",
  app: "overview",
  projects: "project",
};
type AgentProfile = "chat" | "agent" | "code" | "design";
const emptyProfiles: Record<AgentProfile, string> = { chat: "", agent: "", code: "", design: "" };

function ExamplePage({
  title,
  path,
  description,
  children,
}: {
  title: string;
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.pageHeading)}>
        <span {...stylex.props(styles.path)}>{path}</span>
        <h1 {...stylex.props(styles.pageTitle)}>{title}</h1>
        <p {...stylex.props(styles.pageDescription)}>{description}</p>
      </div>
      {children}
    </div>
  );
}

function PageRows({ entries }: { entries: readonly { title: string; detail: string }[] }) {
  return (
    <div {...stylex.props(styles.rows)}>
      {entries.map((item) => (
        <div key={item.title} {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.rowCopy)}>
            <strong {...stylex.props(styles.rowTitle)}>{item.title}</strong>
            <small {...stylex.props(styles.rowDetail)}>{item.detail}</small>
          </span>
          <span aria-hidden="true" {...stylex.props(styles.rowArrow)}>
            →
          </span>
        </div>
      ))}
    </div>
  );
}

const featuredApps = [
  {
    id: "profiles",
    title: "Agent profiles",
    detail: "Add focused chat, code and design profiles",
    icon: SparklesIcon,
  },
  {
    id: "plugins",
    title: "App plugins",
    detail: "Discover pages contributed by your plugins",
    icon: PuzzleIcon,
  },
  {
    id: "projects",
    title: "Projects",
    detail: "Organize work around your Lenso App",
    icon: FolderIcon,
  },
  {
    id: "observe",
    title: "Observe",
    detail: "Trace requests and inspect runtime activity",
    icon: ActivityIcon,
  },
] as const;

function AppsPage({ onOpen }: { onOpen: (id: (typeof featuredApps)[number]["id"]) => void }) {
  const [query, setQuery] = React.useState("");
  const matches = featuredApps.filter((item) =>
    `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section {...stylex.props(styles.marketplace)}>
      <div {...stylex.props(styles.marketplaceContent)}>
        <h1 {...stylex.props(styles.marketplaceTitle)}>Extend your App with Plugins</h1>
        <label {...stylex.props(styles.marketSearch)}>
          <SearchIcon size={17} aria-hidden="true" />
          <input
            aria-label="Search plugins and capabilities"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search plugins and capabilities..."
            type="search"
            value={query}
            {...stylex.props(styles.marketSearchInput)}
          />
        </label>
        <div {...stylex.props(styles.marketHero)}>
          <div {...stylex.props(styles.heroChips)}>
            <div {...stylex.props(styles.heroChip)}>
              <span {...stylex.props(styles.chipBrand, styles.profilesBrand)}>
                <SparklesIcon size={16} aria-hidden="true" /> Profiles
              </span>
              <span {...stylex.props(styles.chipDescription)}>
                Give every Agent a focused way to work
              </span>
            </div>
            <div {...stylex.props(styles.heroChip, styles.secondHeroChip)}>
              <span {...stylex.props(styles.chipBrand)}>
                <PuzzleIcon size={16} aria-hidden="true" /> Plugins
              </span>
              <span {...stylex.props(styles.chipDescription)}>
                Bring your App pages into the Console
              </span>
            </div>
            <div {...stylex.props(styles.heroChip, styles.thirdHeroChip)}>
              <span {...stylex.props(styles.chipBrand, styles.observeBrand)}>
                <ActivityIcon size={16} aria-hidden="true" /> Observe
              </span>
              <span {...stylex.props(styles.chipDescription)}>
                Understand what your App is doing
              </span>
            </div>
          </div>
        </div>
        <h2 {...stylex.props(styles.marketFeaturedTitle)}>Featured</h2>
        {matches.length ? (
          <div {...stylex.props(styles.marketFeaturedList)}>
            {matches.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                  type="button"
                  {...stylex.props(styles.marketFeaturedItem)}
                >
                  <span {...stylex.props(styles.marketFeaturedIcon)}>
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span {...stylex.props(styles.marketFeaturedCopy)}>
                    <strong {...stylex.props(styles.marketFeaturedName)}>{item.title}</strong>
                    <small {...stylex.props(styles.marketFeaturedDetail)}>{item.detail}</small>
                  </span>
                  <ArrowUpRightIcon
                    size={15}
                    aria-hidden="true"
                    {...stylex.props(styles.marketFeaturedArrow)}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <p {...stylex.props(styles.marketEmpty)}>No matching plugins or capabilities.</p>
        )}
      </div>
    </section>
  );
}

function ConsoleTemplatePreview({
  initialWorkspace,
  theme,
}: {
  initialWorkspace: ConsoleWorkspaceId;
  theme: "dark" | "light" | "system";
}) {
  const [workspace, setWorkspace] = React.useState(initialWorkspace);
  const [activeTabs, setActiveTabs] = React.useState<Record<ConsoleWorkspaceId, ConsoleTabId>>({
    ...firstTab,
  });
  const [agentSide, setAgentSide] = React.useState("new");
  const [drafts, setDrafts] = React.useState<Record<AgentProfile, string>>({ ...emptyProfiles });
  const [messages, setMessages] = React.useState<Record<AgentProfile, string>>({
    ...emptyProfiles,
  });
  const activeTab = activeTabs[workspace];
  const changeTab = (tab: ConsoleTabId, targetWorkspace: ConsoleWorkspaceId = workspace) => {
    setActiveTabs((current) => ({ ...current, [targetWorkspace]: tab }));
    if (targetWorkspace === "agent") setAgentSide("new");
  };

  const sidebar =
    workspace === "agent" ? (
      <>
        <ConsoleSidebarItem icon={SparklesIcon} onClick={() => setAgentSide("welcome")}>
          Welcome
        </ConsoleSidebarItem>
        <ConsoleSidebarItem
          active={agentSide === "new"}
          icon={PlusIcon}
          onClick={() => setAgentSide("new")}
        >
          New chat
        </ConsoleSidebarItem>
        <ConsoleSidebarItem icon={FolderIcon} onClick={() => setWorkspace("projects")}>
          Projects
        </ConsoleSidebarItem>
        <ConsoleSidebarItem icon={PanelLeftIcon} onClick={() => setAgentSide("artifacts")}>
          Artifacts
        </ConsoleSidebarItem>
        <ConsoleSidebarItem
          active={agentSide === "apps"}
          icon={LayoutGridIcon}
          onClick={() => setAgentSide("apps")}
        >
          Apps
        </ConsoleSidebarItem>
        <ConsoleSidebarSection title="Projects">
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => setWorkspace("projects")}>
            Console redesign
          </ConsoleSidebarItem>
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => setWorkspace("projects")}>
            Plugin authoring
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
        <ConsoleSidebarSection title="Recents">
          <ConsoleSidebarItem icon={MessageCircleIcon} onClick={() => setAgentSide("new")}>
            Refine workspace layout
          </ConsoleSidebarItem>
          <ConsoleSidebarItem icon={MessageCircleIcon} onClick={() => setAgentSide("new")}>
            Plugin page registration
          </ConsoleSidebarItem>
          <ConsoleSidebarItem icon={MessageCircleIcon} onClick={() => setAgentSide("new")}>
            Agent profiles and tabs
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
      </>
    ) : workspace === "app" ? (
      <>
        <ConsoleSidebarSection first title="Pages">
          <ConsoleSidebarItem
            active={activeTab === "overview"}
            icon={LayoutGridIcon}
            onClick={() => changeTab("overview")}
          >
            Overview
          </ConsoleSidebarItem>
          <ConsoleSidebarItem
            active={activeTab === "members"}
            icon={MessageCircleIcon}
            onClick={() => changeTab("members")}
          >
            Members
          </ConsoleSidebarItem>
          <ConsoleSidebarItem
            active={activeTab === "content"}
            icon={PanelLeftIcon}
            onClick={() => changeTab("content")}
          >
            Content
          </ConsoleSidebarItem>
          <ConsoleSidebarItem
            active={activeTab === "observe"}
            icon={SearchIcon}
            onClick={() => changeTab("observe")}
          >
            Observe
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
        <div {...stylex.props(styles.sidebarFooter)}>
          Development <span {...stylex.props(styles.sidebarFooterDetail)}>Acme App · Local</span>
        </div>
      </>
    ) : (
      <>
        <ConsoleSidebarItem
          active={activeTab === "project"}
          icon={FolderIcon}
          onClick={() => changeTab("project")}
        >
          Project overview
        </ConsoleSidebarItem>
        <ConsoleSidebarItem
          active={activeTab === "board"}
          icon={LayoutGridIcon}
          onClick={() => changeTab("board")}
        >
          My tasks
        </ConsoleSidebarItem>
        <ConsoleSidebarSection title="Active projects">
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => changeTab("project")}>
            Console redesign
          </ConsoleSidebarItem>
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => changeTab("project")}>
            Plugin authoring
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
        <ConsoleSidebarSection title="Views">
          <ConsoleSidebarItem
            active={activeTab === "calendar"}
            icon={PanelLeftIcon}
            onClick={() => changeTab("calendar")}
          >
            Calendar
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
      </>
    );

  let page: React.ReactNode;
  if (workspace === "agent") {
    if (agentSide === "new") {
      const profile = activeTab as AgentProfile;
      page = (
        <ConsoleProfilePage
          draft={drafts[profile]}
          message={messages[profile]}
          onDraftChange={(draft) => setDrafts((current) => ({ ...current, [profile]: draft }))}
          onSend={() => {
            setMessages((current) => ({ ...current, [profile]: drafts[profile].trim() }));
            setDrafts((current) => ({ ...current, [profile]: "" }));
          }}
          profile={profile}
        />
      );
    } else if (agentSide === "apps")
      page = (
        <AppsPage
          onOpen={(id) => {
            if (id === "profiles") {
              changeTab("chat", "agent");
            } else if (id === "plugins") {
              setWorkspace("app");
              changeTab("overview", "app");
            } else if (id === "projects") {
              setWorkspace("projects");
            } else {
              setWorkspace("app");
              changeTab("observe", "app");
            }
          }}
        />
      );
    else
      page = (
        <ExamplePage
          path={`Agent / ${agentSide}`}
          title={agentSide === "welcome" ? "Welcome" : "Artifacts"}
          description={
            agentSide === "welcome"
              ? "Choose a profile to start working with Acme Agent."
              : "Agent outputs will appear here."
          }
        >
          <PageRows
            entries={[
              { title: "Chat", detail: "Analysis, writing, and discussion" },
              { title: "Code", detail: "Implementation and review" },
            ]}
          />
        </ExamplePage>
      );
  } else if (workspace === "app") {
    page = (
      <ExamplePage
        path={`App management / Acme App`}
        title={
          activeTab === "overview"
            ? "App overview"
            : activeTab === "members"
              ? "Members"
              : activeTab === "content"
                ? "Content"
                : "Observe"
        }
        description={
          activeTab === "overview"
            ? "App context and Plugin-registered pages · Demo view"
            : "This page is registered and provided by the corresponding App Plugin."
        }
      >
        {activeTab === "overview" && (
          <div {...stylex.props(styles.focus)}>
            <span {...stylex.props(styles.focusLabel)}>Current App</span>
            <h2 {...stylex.props(styles.focusTitle)}>Acme App · Development</h2>
            <p {...stylex.props(styles.focusDescription)}>
              Console provides navigation and context; the App and its Plugins provide runtime data.
            </p>
          </div>
        )}
        <section {...stylex.props(styles.pageSection)}>
          <h2 {...stylex.props(styles.sectionTitle)}>
            {activeTab === "overview" ? "Registered pages" : "Page content"}
          </h2>
          <PageRows
            entries={
              activeTab === "overview"
                ? [
                    { title: "Members", detail: "Users, roles, and invitations · App Plugin" },
                    { title: "Content", detail: "Articles and media · App Plugin" },
                    { title: "Observe", detail: "Requests and traces · App Plugin" },
                  ]
                : [
                    {
                      title: "Data and actions provided by Plugins",
                      detail: "The Console Shell does not duplicate business rules or permissions",
                    },
                  ]
            }
          />
        </section>
      </ExamplePage>
    );
  } else {
    page = (
      <ExamplePage
        path="Projects / Console"
        title={
          activeTab === "project"
            ? "Project overview"
            : activeTab === "board"
              ? "My tasks"
              : "Calendar"
        }
        description="A standalone Console workspace with its own pages and sidebar."
      >
        <section {...stylex.props(styles.pageSection)}>
          <h2 {...stylex.props(styles.sectionTitle)}>Active projects</h2>
          <PageRows
            entries={[
              { title: "Console redesign", detail: "Navigation, profiles, and Plugin pages" },
              { title: "Plugin authoring", detail: "Page and entry registration" },
            ]}
          />
        </section>
      </ExamplePage>
    );
  }

  return (
    <ConsoleWorkspace
      activeTab={activeTab}
      compactSearch
      onTabChange={changeTab}
      onWorkspaceChange={setWorkspace}
      sidebar={sidebar}
      theme={theme === "light" ? "light" : "dark"}
      workspace={workspace}
    >
      {page}
    </ConsoleWorkspace>
  );
}

export const consoleWorkspaceAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const workspace =
    values.workspace === "app" || values.workspace === "projects" ? values.workspace : "agent";
  return (
    <ThemeScope theme={theme} xstyle={styles.stage}>
      <div {...stylex.props(styles.frame)}>
        <ConsoleTemplatePreview initialWorkspace={workspace} key={workspace} theme={theme} />
      </div>
    </ThemeScope>
  );
};
