"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  FolderIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  PanelLeftIcon,
  PlusIcon,
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
        <div {...stylex.props(styles.sidebarIdentity)}>
          <span aria-hidden="true">◇</span>
          <span {...stylex.props(styles.sidebarIdentityCopy)}>
            <strong {...stylex.props(styles.sidebarIdentityTitle)}>应用管理</strong>
            <small {...stylex.props(styles.sidebarIdentityDetail)}>Acme App</small>
          </span>
        </div>
        <ConsoleSidebarSection title="页面">
          <ConsoleSidebarItem
            active={activeTab === "overview"}
            icon={LayoutGridIcon}
            onClick={() => changeTab("overview")}
          >
            运行概览
          </ConsoleSidebarItem>
          <ConsoleSidebarItem
            active={activeTab === "members"}
            icon={MessageCircleIcon}
            onClick={() => changeTab("members")}
          >
            成员管理
          </ConsoleSidebarItem>
          <ConsoleSidebarItem
            active={activeTab === "content"}
            icon={PanelLeftIcon}
            onClick={() => changeTab("content")}
          >
            内容管理
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
          Development <span {...stylex.props(styles.sidebarFooterDetail)}>Acme App · 本地运行</span>
        </div>
      </>
    ) : (
      <>
        <ConsoleSidebarItem
          active={activeTab === "project"}
          icon={FolderIcon}
          onClick={() => changeTab("project")}
        >
          项目总览
        </ConsoleSidebarItem>
        <ConsoleSidebarItem
          active={activeTab === "board"}
          icon={LayoutGridIcon}
          onClick={() => changeTab("board")}
        >
          我的任务
        </ConsoleSidebarItem>
        <ConsoleSidebarSection title="进行中的项目">
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => changeTab("project")}>
            Console 重构
          </ConsoleSidebarItem>
          <ConsoleSidebarItem icon={FolderIcon} onClick={() => changeTab("project")}>
            插件作者体验
          </ConsoleSidebarItem>
        </ConsoleSidebarSection>
        <ConsoleSidebarSection title="视图">
          <ConsoleSidebarItem
            active={activeTab === "calendar"}
            icon={PanelLeftIcon}
            onClick={() => changeTab("calendar")}
          >
            日程
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
        <ExamplePage
          path="Agent / Apps"
          title="Apps"
          description="发现可以为 App 增加能力的 Plugin。"
        >
          <div {...stylex.props(styles.featured)}>
            <div {...stylex.props(styles.featuredArt)}>
              <SparklesIcon size={20} />
              <span {...stylex.props(styles.featuredArtLabel)}>Profiles · Plugins · Observe</span>
            </div>
            <h2 {...stylex.props(styles.featuredTitle)}>Featured</h2>
            <PageRows
              entries={[
                { title: "Profiles", detail: "Give every Agent a focused way to work" },
                { title: "Plugin pages", detail: "Bring App pages into the Console" },
              ]}
            />
          </div>
        </ExamplePage>
      );
    else
      page = (
        <ExamplePage
          path={`Agent / ${agentSide}`}
          title={agentSide === "welcome" ? "Welcome" : "Artifacts"}
          description={
            agentSide === "welcome"
              ? "选择一个 Profile，开始与 Acme Agent 工作。"
              : "Agent 生成的成果会显示在这里。"
          }
        >
          <PageRows
            entries={[
              { title: "Chat", detail: "分析、写作和讨论" },
              { title: "Code", detail: "实现与审查" },
            ]}
          />
        </ExamplePage>
      );
  } else if (workspace === "app") {
    page = (
      <ExamplePage
        path={`应用管理 / Acme App`}
        title={
          activeTab === "overview"
            ? "应用概览"
            : activeTab === "members"
              ? "成员管理"
              : activeTab === "content"
                ? "内容管理"
                : "Observe"
        }
        description={
          activeTab === "overview"
            ? "App 上下文与 Plugin 注册页面 · 演示视图"
            : "这个页面由对应的 App Plugin 注册并提供。"
        }
      >
        {activeTab === "overview" && (
          <div {...stylex.props(styles.focus)}>
            <span {...stylex.props(styles.focusLabel)}>当前 App</span>
            <h2 {...stylex.props(styles.focusTitle)}>Acme App · Development</h2>
            <p {...stylex.props(styles.focusDescription)}>
              Console 提供导航与上下文；运行事实由 App 和对应 Plugin 提供。
            </p>
          </div>
        )}
        <section {...stylex.props(styles.pageSection)}>
          <h2 {...stylex.props(styles.sectionTitle)}>
            {activeTab === "overview" ? "已注册页面" : "页面内容"}
          </h2>
          <PageRows
            entries={
              activeTab === "overview"
                ? [
                    { title: "成员管理", detail: "用户、角色与邀请 · App Plugin" },
                    { title: "内容管理", detail: "文章与媒体 · App Plugin" },
                    { title: "Observe", detail: "请求与追踪 · App Plugin" },
                  ]
                : [
                    {
                      title: "由 Plugin 提供的数据与操作",
                      detail: "Console Shell 不复制业务规则或权限",
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
        title={activeTab === "project" ? "项目总览" : activeTab === "board" ? "我的任务" : "日程"}
        description="一个独立的 Console 工作区，拥有自己的页面和侧栏。"
      >
        <section {...stylex.props(styles.pageSection)}>
          <h2 {...stylex.props(styles.sectionTitle)}>进行中的项目</h2>
          <PageRows
            entries={[
              { title: "Console 重构", detail: "导航、Profile 与 Plugin 页面" },
              { title: "插件作者体验", detail: "注册页面和入口" },
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
