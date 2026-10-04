// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0. Base UI measures one indicator per list.
import { Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { styles } from "../../en/tabs/source.stylex";
const sections = [
  {
    value: "overview",
    label: "Overview",
    content: "View your project overview and recent activity.",
  },
  {
    value: "analytics",
    label: "Analytics",
    content: "Track your metrics and analyze performance data.",
  },
  {
    value: "reports",
    label: "Reports",
    content: "Generate and download detailed reports.",
  },
];
function ProjectTabs({
  separators = false,
  ...props
}: ComponentProps<typeof Tabs> & {
  separators?: boolean;
}) {
  return (
    <Tabs defaultValue="overview" xstyle={styles.root} {...props}>
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus aria-label="Options">
          {sections.map((item, index) => (
            <Tabs.Tab key={item.value} value={item.value}>
              {separators && index > 0 && <Tabs.Separator />}
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      {sections.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} xstyle={styles.panel}>
          <p>{item.content}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
const settings = [
  {
    value: "account",
    label: "Account",
    title: "Account Settings",
    content: "Manage your account information and preferences.",
  },
  {
    value: "security",
    label: "Security",
    title: "Security Settings",
    content: "Configure two-factor authentication and password settings.",
  },
  {
    value: "notifications",
    label: "Notifications",
    title: "Notification Preferences",
    content: "Choose how and when you want to receive notifications.",
  },
  {
    value: "billing",
    label: "Billing",
    title: "Billing Information",
    content: "View and manage your subscription and payment methods.",
  },
];
function SettingsTabs(props: ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="account" orientation="vertical" xstyle={styles.vertical} {...props}>
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus aria-label="Vertical tabs">
          {settings.map((item) => (
            <Tabs.Tab key={item.value} value={item.value}>
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      {settings.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} xstyle={styles.verticalPanel}>
          <h3 {...stylex.props(styles.heading)}>{item.title}</h3>
          <p {...stylex.props(styles.muted)}>{item.content}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
export function Secondary() {
  return <ProjectTabs variant="secondary" />;
}
export function WithSeparator() {
  return <ProjectTabs separators />;
}
export function Vertical() {
  return <SettingsTabs />;
}
export function SecondaryVertical() {
  return <SettingsTabs variant="secondary" />;
}
export function VerticalAlignment() {
  const items = [
    {
      value: "general",
      label: "General",
      content: "Manage your account information and preferences.",
    },
    {
      value: "billing",
      label: "Subscription & Billing",
      content: "View and manage your plan and payment methods.",
    },
    {
      value: "appearance",
      label: "Appearance",
      content: "Choose a theme and adjust the interface density.",
    },
    {
      value: "notifications",
      label: "Notifications",
      content: "Choose how and when you want to receive notifications.",
    },
    {
      value: "privacy",
      label: "Privacy",
      content: "Control what you share and who can see your activity.",
    },
  ];
  return (
    <Tabs
      defaultValue="general"
      align="start"
      orientation="vertical"
      variant="secondary"
      xstyle={styles.vertical}
    >
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus aria-label="Settings">
          {items.map((item) => (
            <Tabs.Tab key={item.value} value={item.value}>
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      {items.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} xstyle={styles.verticalPanel}>
          <h3 {...stylex.props(styles.heading)}>{item.label}</h3>
          <p {...stylex.props(styles.muted)}>{item.content}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
export function Overflow() {
  const items = [
    "Overview",
    "Analytics",
    "Reports",
    "Performance",
    "Engagement",
    "Audience",
    "Acquisition",
    "Retention",
    "Settings",
  ];
  return (
    <div {...stylex.props(styles.overflow)}>
      <Tabs defaultValue="overview">
        <Tabs.ListContainer>
          <Tabs.List activateOnFocus aria-label="Overflow options">
            {items.map((label) => (
              <Tabs.Tab key={label} value={label.toLowerCase()}>
                {label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
        {items.map((label) => (
          <Tabs.Panel key={label} value={label.toLowerCase()} xstyle={styles.panel}>
            <p>{label} panel content.</p>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
export function Disabled() {
  const items = [
    {
      value: "active",
      label: "启用",
      content: "此标签页已启用，可以选择。",
    },
    {
      value: "disabled",
      label: "已禁用",
      content: "无法访问此内容。",
    },
    {
      value: "available",
      label: "可用",
      content: "此标签页也可以选择。",
    },
  ];
  return (
    <Tabs defaultValue="active" xstyle={styles.root}>
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus aria-label="含禁用项的标签页">
          {items.map((item) => (
            <Tabs.Tab key={item.value} value={item.value} disabled={item.value === "disabled"}>
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      {items.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} xstyle={styles.panel}>
          <p>{item.content}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
export function CustomStyles() {
  return (
    <Tabs defaultValue="monthly" xstyle={styles.customRoot}>
      <Tabs.ListContainer xstyle={styles.customContainer}>
        <Tabs.List activateOnFocus aria-label="Billing cycle" xstyle={styles.customList}>
          <Tabs.Tab value="monthly" xstyle={styles.customTab}>
            Monthly
          </Tabs.Tab>
          <Tabs.Tab value="yearly" xstyle={styles.customTab}>
            Yearly
          </Tabs.Tab>
          <Tabs.Indicator xstyle={styles.customIndicator} />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="monthly" xstyle={styles.customPanel}>
        Billed monthly, cancel anytime.
      </Tabs.Panel>
      <Tabs.Panel value="yearly" xstyle={styles.customPanel}>
        Save 20% with annual billing.
      </Tabs.Panel>
    </Tabs>
  );
}
