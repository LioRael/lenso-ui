"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BotIcon,
  BoxIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  ChevronRightIcon,
  InboxIcon,
  LayersIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  StoreIcon,
} from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Disclosure } from "@lenso/ui/disclosure";
import { IconButton } from "@lenso/ui/icon-button";
import { PageHeader } from "@lenso/ui/page-header";
import { QuickLink } from "@lenso/ui/quick-link";
import { Sidebar } from "@lenso/ui/sidebar";
import { Tabs } from "@lenso/ui/tabs";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";

function stringValue(
  values: Readonly<Record<string, boolean | number | string>>,
  id: string,
  fallback: string,
) {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
}

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

export const breadcrumbAdapter: PlaygroundAdapter = ({ example, theme }) => {
  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link nativeButton={false} render={<Link href="#workspace" />}>
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
                  <Breadcrumb.Link nativeButton={false} render={<Link href="#project" />}>
                    Workspace
                  </Breadcrumb.Link>
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
    </ThemeScope>
  );
};

function DisclosurePreview({ multiple }: { multiple: boolean }) {
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

export const disclosureAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas" theme={theme}>
    <DisclosurePreview multiple={values.multiple === true} />
  </ThemeScope>
);

function HeaderDemo({ variant }: { variant: string }) {
  if (variant === "simple") {
    return (
      <PageHeader.Root variant="simple">
        <PageHeader.Row>
          <PageHeader.Title>Preferences</PageHeader.Title>
        </PageHeader.Row>
      </PageHeader.Root>
    );
  }
  if (variant === "issues") {
    return (
      <PageHeader.Root aria-label="Issues navigation" variant="issues">
        <PageHeader.TabsRoot defaultValue="overview">
          <PageHeader.Row>
            <Breadcrumb.Root aria-label="Issues breadcrumb">
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link>
                    <Breadcrumb.Icon>
                      <StoreIcon size={14} />
                    </Breadcrumb.Icon>
                    TestABl
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>Issues</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>
            <PageHeader.Actions>
              <IconButton aria-label="Add Issues to favorites" variant="ghost">
                <StarIcon />
              </IconButton>
              <IconButton aria-label="Issues actions" variant="ghost">
                <MoreHorizontalIcon />
              </IconButton>
            </PageHeader.Actions>
          </PageHeader.Row>
          <PageHeader.TabsRow>
            <PageHeader.TabsList aria-label="Issue sections">
              <PageHeader.Tab value="overview">Overview</PageHeader.Tab>
              <PageHeader.Tab value="documents">Documents</PageHeader.Tab>
              <PageHeader.Tab value="members">Members</PageHeader.Tab>
            </PageHeader.TabsList>
          </PageHeader.TabsRow>
        </PageHeader.TabsRoot>
      </PageHeader.Root>
    );
  }
  return (
    <PageHeader.Root aria-label="Team navigation" variant="team">
      <PageHeader.TabsRoot defaultValue="overview">
        <PageHeader.Row>
          <PageHeader.Leading>
            <StoreIcon size={16} />
          </PageHeader.Leading>
          <PageHeader.Title>TestABl</PageHeader.Title>
          <PageHeader.Actions>
            <IconButton aria-label="Add to favorites" variant="ghost">
              <StarIcon />
            </IconButton>
            <IconButton aria-label="Team actions" variant="ghost">
              <MoreHorizontalIcon />
            </IconButton>
          </PageHeader.Actions>
          <PageHeader.Spacer />
          <IconButton aria-label="Copy team URL" variant="ghost">
            <LinkIcon />
          </IconButton>
        </PageHeader.Row>
        <PageHeader.TabsRow>
          <PageHeader.TabsList aria-label="Team sections">
            <PageHeader.Tab value="overview">Overview</PageHeader.Tab>
            <PageHeader.Tab value="documents">Documents</PageHeader.Tab>
            <PageHeader.Tab value="members">Members</PageHeader.Tab>
          </PageHeader.TabsList>
        </PageHeader.TabsRow>
      </PageHeader.TabsRoot>
    </PageHeader.Root>
  );
}

export const pageHeaderAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas page-header-stage" theme={theme}>
    <div style={{ width: "100%" }}>
      <HeaderDemo variant={stringValue(values, "variant", "team")} />
    </div>
  </ThemeScope>
);

export const quickLinkAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope className="stage-canvas" theme={theme}>
    <QuickLink
      disabled={values.disabled === true}
      leadingIcon={<SettingsIcon size={16} />}
      trailingIcon={<ChevronRightIcon size={14} />}
    >
      Team settings
    </QuickLink>
  </ThemeScope>
);

const sidebarIconProps = { size: 16, strokeWidth: 1.5 };

function SidebarSection({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Disclosure.Root defaultValue={[label]}>
      <Disclosure.Item value={label}>
        <Sidebar.SectionHeader>
          <Disclosure.Header>
            <Sidebar.SectionTrigger>
              {label}
              <Disclosure.Icon />
            </Sidebar.SectionTrigger>
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

function SidebarPreview() {
  const [selectedItem, setSelectedItem] = React.useState("home");

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
            <SidebarSection label="Navigation">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<InboxIcon {...sidebarIconProps} />}
                    onClick={() => setSelectedItem("inbox")}
                    selected={selectedItem === "inbox"}
                  >
                    Inbox
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<LayersIcon {...sidebarIconProps} />}
                    onClick={() => setSelectedItem("my-issues")}
                    selected={selectedItem === "my-issues"}
                  >
                    My issues
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BotIcon {...sidebarIconProps} />}
                    onClick={() => setSelectedItem("agent")}
                    selected={selectedItem === "agent"}
                  >
                    Agent
                  </Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </SidebarSection>
            <SidebarSection label="Workspace">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BoxIcon {...sidebarIconProps} />}
                    onClick={() => setSelectedItem("workspace-projects")}
                    selected={selectedItem === "workspace-projects"}
                  >
                    Projects
                  </Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<LayersIcon {...sidebarIconProps} />}
                    onClick={() => setSelectedItem("workspace-views")}
                    selected={selectedItem === "workspace-views"}
                  >
                    Views
                  </Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </SidebarSection>
            <SidebarSection label="Your teams">
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item
                    icon={<BoxIcon {...sidebarIconProps} />}
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
            </SidebarSection>
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

export const sidebarAdapter: PlaygroundAdapter = ({ theme }) => (
  <ThemeScope className="stage-canvas sidebar-stage-canvas" theme={theme}>
    <SidebarPreview />
  </ThemeScope>
);

export const tabsAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const selected = stringValue(values, "selected", "overview");
  return (
    <ThemeScope className="stage-canvas tabs-stage" theme={theme}>
      <Tabs.Root onValueChange={(value) => setValue("selected", value)} value={selected}>
        <Tabs.List aria-label="Project sections">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
        </Tabs.List>
        {(["overview", "documents", "members"] as const).map((value) => (
          <Tabs.Panel key={value} value={value}>
            <p>{value[0]!.toUpperCase() + value.slice(1)} content</p>
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </ThemeScope>
  );
};
