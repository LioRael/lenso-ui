"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  Code2Icon,
  FolderIcon,
  LayoutGridIcon,
  MenuIcon,
  MessageCircleIcon,
  PanelLeftIcon,
  PenLineIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { PromptComposer } from "../recipes/prompt-composer";
import { styles } from "./console-workspace.stylex";

export type ConsoleWorkspaceId = "agent" | "app" | "projects";
export type ConsoleTabId =
  | "chat"
  | "agent"
  | "code"
  | "design"
  | "overview"
  | "members"
  | "content"
  | "observe"
  | "project"
  | "board"
  | "calendar";

const workspaces = [
  { id: "agent", label: "Agent", detail: "Acme Agent · Web UI" },
  { id: "app", label: "应用管理", detail: "Acme App · Development" },
  { id: "projects", label: "Projects", detail: "Console workspace" },
] as const;

const tabs: Record<
  ConsoleWorkspaceId,
  readonly { id: ConsoleTabId; label: string; icon: React.ElementType }[]
> = {
  agent: [
    { id: "chat", label: "Chat", icon: SparklesIcon },
    { id: "agent", label: "Agent", icon: MessageCircleIcon },
    { id: "code", label: "Code", icon: Code2Icon },
    { id: "design", label: "Design", icon: PenLineIcon },
  ],
  app: [
    { id: "overview", label: "概览", icon: LayoutGridIcon },
    { id: "members", label: "成员", icon: MessageCircleIcon },
    { id: "content", label: "内容", icon: PanelLeftIcon },
    { id: "observe", label: "Observe", icon: SearchIcon },
  ],
  projects: [
    { id: "project", label: "项目", icon: FolderIcon },
    { id: "board", label: "看板", icon: LayoutGridIcon },
    { id: "calendar", label: "日程", icon: PanelLeftIcon },
  ],
};

export interface ConsoleWorkspaceProps {
  activeTab: ConsoleTabId;
  assistant?: React.ReactNode;
  children: React.ReactNode;
  compactSearch?: boolean;
  onTabChange: (tab: ConsoleTabId, workspace?: ConsoleWorkspaceId) => void;
  onWorkspaceChange: (workspace: ConsoleWorkspaceId) => void;
  sidebar: React.ReactNode;
  theme?: "dark" | "light";
  workspace: ConsoleWorkspaceId;
}

export function ConsoleWorkspace({
  activeTab,
  assistant,
  children,
  compactSearch = false,
  onTabChange,
  onWorkspaceChange,
  sidebar,
  theme = "dark",
  workspace,
}: ConsoleWorkspaceProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const workspaceLabel = workspaces.find((item) => item.id === workspace)?.label ?? "Agent";
  const searchItems = workspaces.flatMap((item) =>
    tabs[item.id].map((tab) => ({ ...tab, workspace: item.id, workspaceLabel: item.label })),
  );
  const matches = searchItems.filter((item) =>
    `${item.workspaceLabel} ${item.label}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setMobileNavOpen(false);
        setAssistantOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      {...stylex.props(styles.root, theme === "light" && styles.lightRoot)}
      data-slot="console-workspace-template"
    >
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerLeading)}>
          <button
            aria-label={mobileNavOpen ? "关闭侧栏" : "打开侧栏"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            type="button"
            {...stylex.props(styles.iconButton, styles.mobileNavTrigger)}
          >
            <MenuIcon size={16} />
          </button>
          <div {...stylex.props(styles.workspaceAnchor)}>
            <button
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              {...stylex.props(styles.workspaceTrigger)}
            >
              <span {...stylex.props(styles.mark)} aria-hidden="true">
                ✳
              </span>
              <span {...stylex.props(styles.mobileWorkspaceName)}>{workspaceLabel}</span>
              <ChevronDownIcon size={13} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div {...stylex.props(styles.workspaceMenu)}>
                <span {...stylex.props(styles.menuCaption)}>工作区</span>
                {workspaces.map((item) => (
                  <button
                    aria-pressed={item.id === workspace}
                    key={item.id}
                    onClick={() => {
                      onWorkspaceChange(item.id);
                      setMenuOpen(false);
                      setMobileNavOpen(false);
                    }}
                    type="button"
                    {...stylex.props(
                      styles.workspaceOption,
                      item.id === workspace && styles.selectedOption,
                    )}
                  >
                    <span {...stylex.props(styles.optionIcon)} aria-hidden="true">
                      {item.id === "agent" ? "✳" : item.id === "app" ? "◇" : "▱"}
                    </span>
                    <span {...stylex.props(styles.optionCopy)}>
                      <strong {...stylex.props(styles.optionTitle)}>{item.label}</strong>
                      <small {...stylex.props(styles.optionDetail)}>{item.detail}</small>
                    </span>
                    {item.id === workspace && (
                      <span {...stylex.props(styles.optionCheck)} aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            aria-label="Console 助手"
            aria-expanded={assistantOpen}
            onClick={() => setAssistantOpen(!assistantOpen)}
            type="button"
            {...stylex.props(styles.assistantTrigger, assistantOpen && styles.activeTab)}
          >
            <SparklesIcon size={14} aria-hidden="true" {...stylex.props(styles.accentIcon)} />
            <span {...stylex.props(styles.assistantLabel)}>助手</span>
          </button>
          <span {...stylex.props(styles.divider)} aria-hidden="true" />
          <nav aria-label={`${workspaceLabel} 页面`} {...stylex.props(styles.tabs)}>
            {tabs[workspace].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  aria-current={item.id === activeTab ? "page" : undefined}
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMenuOpen(false);
                    setMobileNavOpen(false);
                  }}
                  type="button"
                  {...stylex.props(styles.tab, item.id === activeTab && styles.activeTab)}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <button
          aria-label="搜索 Console"
          onClick={() => setSearchOpen(true)}
          type="button"
          {...stylex.props(styles.searchTrigger, compactSearch && styles.compactSearchTrigger)}
        >
          <SearchIcon size={16} aria-hidden="true" />
          <span {...stylex.props(styles.searchLabel, compactSearch && styles.compactSearchCopy)}>
            搜索 Console…
          </span>
          <kbd {...stylex.props(styles.shortcut, compactSearch && styles.compactSearchCopy)}>
            ⌘ K
          </kbd>
        </button>
      </header>
      <div {...stylex.props(styles.body)}>
        {mobileNavOpen && (
          <button
            aria-label="关闭侧栏"
            onClick={() => setMobileNavOpen(false)}
            type="button"
            {...stylex.props(styles.mobileScrim)}
          />
        )}
        <aside
          aria-label={`${workspaceLabel} 侧栏`}
          onClickCapture={(event) => {
            if (
              mobileNavOpen &&
              event.target instanceof Element &&
              event.target.closest("button")
            ) {
              setMobileNavOpen(false);
            }
          }}
          {...stylex.props(styles.sidebar, mobileNavOpen && styles.openMobileSidebar)}
        >
          {sidebar}
        </aside>
        <main {...stylex.props(styles.main)}>{children}</main>
      </div>
      {assistantOpen && (
        <aside aria-label="Console 助手" {...stylex.props(styles.assistantDrawer)}>
          <div {...stylex.props(styles.drawerHeader)}>
            <span {...stylex.props(styles.drawerTitle)}>
              <SparklesIcon size={15} aria-hidden="true" /> 助手
            </span>
            <button
              aria-label="关闭助手"
              onClick={() => setAssistantOpen(false)}
              type="button"
              {...stylex.props(styles.iconButton)}
            >
              <XIcon size={15} />
            </button>
          </div>
          {assistant ?? (
            <p {...stylex.props(styles.drawerCopy)}>
              我可以协助操作 Console，并理解当前工作区的上下文。
            </p>
          )}
          <div {...stylex.props(styles.drawerContext)}>当前上下文 · {workspaceLabel}</div>
        </aside>
      )}
      {searchOpen && (
        <div {...stylex.props(styles.searchOverlay)}>
          <button
            aria-label="关闭搜索"
            onClick={() => setSearchOpen(false)}
            type="button"
            {...stylex.props(styles.overlayBackdrop)}
          />
          <dialog
            aria-label="搜索 Console"
            aria-modal="true"
            open
            {...stylex.props(styles.searchDialog)}
          >
            <div {...stylex.props(styles.searchField)}>
              <SearchIcon size={17} />
              <input
                autoFocus
                aria-label="搜索页面"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索工作区与页面…"
                value={query}
                {...stylex.props(styles.searchInput)}
              />
            </div>
            <div {...stylex.props(styles.searchResults)}>
              {matches.length ? (
                matches.map((item) => (
                  <button
                    key={`${item.workspace}-${item.id}`}
                    onClick={() => {
                      onWorkspaceChange(item.workspace);
                      onTabChange(item.id, item.workspace);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    type="button"
                    {...stylex.props(styles.searchResult)}
                  >
                    <span>{item.label}</span>
                    <small {...stylex.props(styles.searchResultScope)}>{item.workspaceLabel}</small>
                  </button>
                ))
              ) : (
                <p {...stylex.props(styles.emptySearch)}>没有匹配的页面。</p>
              )}
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

export function ConsoleSidebarItem({
  active,
  children,
  icon: Icon,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      type="button"
      {...stylex.props(styles.sidebarItem, active && styles.activeSidebarItem)}
    >
      <Icon size={14} aria-hidden="true" />
      <span {...stylex.props(styles.sidebarItemLabel)}>{children}</span>
    </button>
  );
}

export function ConsoleSidebarSection({
  children,
  first = false,
  title,
}: {
  children: React.ReactNode;
  first?: boolean;
  title: string;
}) {
  return (
    <section {...stylex.props(styles.sidebarSection, first && styles.firstSidebarSection)}>
      <h2 {...stylex.props(styles.sidebarSectionTitle)}>{title}</h2>
      {children}
    </section>
  );
}

export function ConsoleProfilePage({
  profile,
  draft,
  message,
  onDraftChange,
  onSend,
}: {
  profile: "chat" | "agent" | "code" | "design";
  draft: string;
  message: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
}) {
  const copy = {
    chat: [
      "从一个问题开始",
      "分析、写作或讨论想法，Acme Agent 会在这个会话里继续。",
      "向 Acme Agent 提问…",
    ],
    agent: ["交代一项任务", "描述目标与边界，Agent 会在需要你决定时停下来。", "描述要完成的任务…"],
    code: ["描述要实现的内容", "围绕当前项目讨论代码、变更和验证。", "描述需要实现或修改的行为…"],
    design: [
      "从一个设计问题开始",
      "讨论界面、交互和取舍，保留同一条设计会话。",
      "描述想探索的界面或交互…",
    ],
  }[profile];

  return (
    <div {...stylex.props(styles.profilePage)}>
      <div {...stylex.props(styles.profileContent)}>
        {message ? (
          <div {...stylex.props(styles.message)}>{message}</div>
        ) : (
          <div {...stylex.props(styles.profileIntro)}>
            <h1 {...stylex.props(styles.profileTitle)}>{copy[0]}</h1>
            <p {...stylex.props(styles.profileDescription)}>{copy[1]}</p>
          </div>
        )}
        <div {...stylex.props(styles.composerDock)}>
          <PromptComposer.Root
            onSubmit={(event) => {
              event.preventDefault();
              if (draft.trim()) onSend();
            }}
            onValueChange={onDraftChange}
            submitShortcut="enter"
            surfaceXstyle={styles.composerSurface}
            value={draft}
            xstyle={styles.composer}
          >
            <PromptComposer.Input
              aria-label="发送给 Acme Agent"
              placeholder={copy[2]}
              xstyle={styles.composerInput}
            />
            <PromptComposer.Toolbar xstyle={styles.composerToolbar}>
              <button aria-label="添加附件" type="button" {...stylex.props(styles.composerQuiet)}>
                <PlusIcon size={16} />
              </button>
              <PromptComposer.Actions>
                <button
                  aria-label="发送消息"
                  disabled={!draft.trim()}
                  type="submit"
                  {...stylex.props(styles.sendButton)}
                >
                  <ArrowUpIcon size={16} />
                </button>
              </PromptComposer.Actions>
            </PromptComposer.Toolbar>
          </PromptComposer.Root>
        </div>
      </div>
    </div>
  );
}
