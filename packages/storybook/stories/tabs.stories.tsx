// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, type TabsRootProps } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";
import { zoomLevels } from "./navigation-assets";
const meta = {
  argTypes: { align: { control: { type: "select" }, options: ["start", "center", "end"] } },
  component: Tabs,
  parameters: { layout: "centered" },
  title: "Components/Navigation/Tabs",
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
const overview = [
  { id: "overview", label: "Overview", content: "View your project overview and recent activity." },
  {
    id: "analytics",
    label: "Analytics",
    content: "Track your metrics and analyze performance data.",
  },
  { id: "reports", label: "Reports", content: "Generate and download detailed reports." },
];
const overflow = [
  "Overview",
  "Analytics",
  "Reports",
  "Performance",
  "Engagement",
  "Audience",
  "Acquisition",
  "Retention",
  "Settings",
].map((label) => ({ id: label.toLowerCase(), label, content: `${label} panel content.` }));
const vertical = [
  {
    id: "account",
    label: "Account",
    heading: "Account Settings",
    content: "Manage your account information and preferences.",
  },
  {
    id: "security",
    label: "Security",
    heading: "Security Settings",
    content: "Configure two-factor authentication and password settings.",
  },
  {
    id: "notifications",
    label: "Notifications",
    heading: "Notification Preferences",
    content: "Choose how and when you want to receive notifications.",
  },
  {
    id: "billing",
    label: "Billing",
    heading: "Billing Information",
    content: "View and manage your subscription and payment methods.",
  },
];
type Item = { id: string; label: string; content?: string; heading?: string; disabled?: boolean };
function Template({
  items = overview,
  label = "Options",
  separators = false,
  custom = false,
  ...args
}: TabsRootProps & { items?: Item[]; label?: string; separators?: boolean; custom?: boolean }) {
  const isVertical = args.orientation === "vertical";
  return (
    <div {...stylex.props(items === overflow ? s.tabs400 : custom ? s.tabs380 : s.tabs600)}>
      <Tabs defaultValue={items[0]!.id} {...args}>
        <Tabs.ListContainer>
          <Tabs.List activateOnFocus aria-label={label} xstyle={custom && s.customList}>
            {items.map((item, index) => (
              <Tabs.Tab
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                xstyle={custom && s.customTab}
              >
                {separators && index > 0 && <Tabs.Separator />}
                {item.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator xstyle={custom && s.accentIndicator} />
          </Tabs.List>
        </Tabs.ListContainer>
        {!custom &&
          items.map((item) => (
            <Tabs.Panel
              key={item.id}
              value={item.id}
              xstyle={isVertical ? s.verticalPanel : s.panel}
            >
              {item.heading && <h3 {...stylex.props(s.panelHeading)}>{item.heading}</h3>}
              <p {...stylex.props(isVertical && s.panelText)}>{item.content}</p>
            </Tabs.Panel>
          ))}
      </Tabs>
    </div>
  );
}
const disabledItems = [
  { id: "active", label: "Active", content: "This tab is active and can be selected." },
  {
    id: "disabled",
    label: "Disabled",
    disabled: true,
    content: "This content cannot be accessed.",
  },
  { id: "available", label: "Available", content: "This tab is also available for selection." },
];
const defaultItems = [
  { id: "active", label: "Active", content: "This tab is active and can be selected." },
  { id: "default", label: "Default", content: "This tab is the default selection." },
  { id: "available", label: "Available", content: "This tab is available for selection as well." },
];
const controlledItems = [
  { id: "active", label: "Active", content: "This tab is active and can be selected." },
  { id: "controlled", label: "Controlled", content: "This tab is the controlled selection." },
  { id: "available", label: "Available", content: "This tab is available for selection." },
];
function ControlledTemplate(args: TabsRootProps) {
  const [value, setValue] = useState<string>("controlled");
  return (
    <div {...stylex.props(s.tabs600)}>
      <p {...stylex.props(s.selection)}>Selected: {value}</p>
      <Template
        items={controlledItems}
        label="Tabs with controlled options"
        value={value}
        onValueChange={(next) => setValue(String(next))}
        {...args}
      />
    </div>
  );
}
function ShowcaseTemplate(args: TabsRootProps) {
  // The source mixes numeric keys with string item IDs; normalize at the native value boundary.
  const [selectedZoom, setSelectedZoom] = useState("200");
  return (
    <div {...stylex.props(s.cameraRoot)}>
      <div {...stylex.props(s.cameraColumn)}>
        <div {...stylex.props(s.cameraFrame)}>
          {zoomLevels.map((zoom) => (
            <img
              key={zoom.id}
              alt={`${zoom.label} camera view`}
              aria-hidden={selectedZoom !== zoom.id}
              data-selected={selectedZoom === zoom.id}
              src={zoom.src}
              {...stylex.props(s.cameraImage)}
            />
          ))}
        </div>
        <Tabs {...args} defaultValue="200" onValueChange={(next) => setSelectedZoom(String(next))}>
          <Tabs.ListContainer xstyle={s.cameraContainer}>
            <Tabs.List activateOnFocus aria-label="Options" xstyle={s.cameraList}>
              {zoomLevels.map((zoom) => (
                <Tabs.Tab
                  key={zoom.id}
                  value={zoom.id}
                  xstyle={[s.cameraTab, zoom.id === "macro" && s.capitalize]}
                >
                  {zoom.label}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator xstyle={s.cameraIndicator} />
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
        <div {...stylex.props(s.zoomFrame)}>
          {zoomLevels.map((zoom) => (
            <p
              key={zoom.id}
              aria-hidden={selectedZoom !== zoom.id}
              data-selected={selectedZoom === zoom.id}
              {...stylex.props(s.zoom, selectedZoom !== zoom.id && s.srOnly)}
            >
              {zoom.zoom}
            </p>
          ))}
        </div>
        <footer {...stylex.props(s.cameraFooter)}>
          <a href="https://www.apple.com/iphone-17-pro/" rel="noopener noreferrer" target="_blank">
            Showcase based on Apple&apos;s iPhone 17 Pro camera zoom showcase
          </a>
        </footer>
      </div>
    </div>
  );
}
export const Default: Story = {
  args: { children: null },
  render: (props) => <Template {...props} />,
};
export const Overflow: Story = {
  args: { children: null },
  render: (props) => <Template {...props} items={overflow} label="Overflow options" />,
};
export const Vertical: Story = {
  args: { children: null, orientation: "vertical" },
  render: (props) => (
    <Template {...props} orientation="vertical" items={vertical} label="Vertical tabs" />
  ),
};
export const VerticalAlign: Story = {
  args: { align: "end", children: null, orientation: "vertical", variant: "secondary" },
  render: (props) => (
    <Template {...props} orientation="vertical" items={vertical} label="Vertical tabs" />
  ),
};
export const WithDisabledTab: Story = {
  args: { children: null },
  render: (props) => <Template {...props} items={disabledItems} label="Tabs with disabled" />,
};
export const WithDefaultSelectedTab: Story = {
  args: { children: null },
  render: (props) => (
    <Template
      defaultValue="default"
      {...props}
      items={defaultItems}
      label="Tabs with default options"
    />
  ),
};
export const WithControlledSelectionTab: Story = {
  args: { children: null },
  render: ControlledTemplate,
};
export const WithCustomStyle: Story = {
  args: { children: null },
  render: (props) => (
    <Template
      {...props}
      custom
      items={["Daily", "Weekly", "Bi-Weekly", "Monthly"].map((label) => ({
        id: label.toLowerCase(),
        label,
      }))}
    />
  ),
};
export const WithSeparator: Story = {
  args: { children: null },
  render: (props) => <Template {...props} separators />,
};
export const Showcase1: Story = {
  args: { children: null },
  render: ShowcaseTemplate,
  name: "Showcases/Apple iPhone 17 Pro cameras",
};
export const Secondary: Story = {
  args: { children: null, variant: "secondary" },
  render: (props) => <Template {...props} variant="secondary" />,
};
export const SecondaryVertical: Story = {
  args: { children: null, orientation: "vertical", variant: "secondary" },
  render: (props) => (
    <Template
      {...props}
      orientation="vertical"
      variant="secondary"
      items={vertical}
      label="Vertical tabs"
    />
  ),
};
