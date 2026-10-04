// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Switch } from "@lenso/ui";
import { SwitchItem } from "./choice-fixtures";
import { ChoiceIcon, type ChoiceIconName } from "./choice-icons";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <SwitchItem label="Enable notifications" /> };
export const Disabled: Story = {
  render: () => <SwitchItem disabled label="Enable notifications" />,
};
export const DefaultSelected: Story = {
  render: () => <SwitchItem defaultChecked label="Enable notifications" />,
};
export const DisabledDefaultSelected: Story = {
  render: () => (
    <SwitchItem defaultChecked disabled aria-label="Enable notifications" label={null} />
  ),
};
export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = React.useState(false);
    return (
      <div {...stylex.props(s.column)}>
        <SwitchItem checked={checked} onCheckedChange={setChecked} label="Enable notifications" />
        <p {...stylex.props(s.status)}>Switch is {checked ? "on" : "off"}</p>
      </div>
    );
  },
};
export const WithoutLabel: Story = {
  render: () => <SwitchItem aria-label="Enable notifications" label={null} />,
};
export const Invalid: Story = {
  render: () => (
    <SwitchItem
      invalid
      required
      name="notifications"
      label="Enable notifications"
      error="You must enable notifications to continue"
    />
  ),
};
export const Validation: Story = {
  render: () => (
    <SwitchItem
      required
      name="terms-switch"
      validate={(checked) => (checked ? null : "You must accept to continue")}
      error="You must accept to continue"
      label="Accept terms"
    />
  ),
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.row)}>
      <SwitchItem size="sm" label="Small" />
      <SwitchItem size="md" label="Medium" />
      <SwitchItem size="lg" label="Large" />
    </div>
  ),
};
export const LabelBefore: Story = {
  render: () => <SwitchItem before label="Enable notifications" />,
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.maxWidth)}>
      <SwitchItem
        label="Public profile"
        description="Allow others to see your profile information"
      />
    </div>
  ),
};
export const WithCustomStyles: Story = {
  render: () => (
    <SwitchItem
      aria-label="Power"
      label={null}
      controlStyle={s.customSwitchControl}
      thumbStyle={s.customSwitchThumb}
      thumb={(checked) => (
        <Switch.Icon>
          <ChoiceIcon name={checked ? "check" : "power"} {...stylex.props(s.customSwitchIcon)} />
        </Switch.Icon>
      )}
    />
  ),
};
export const WithIcons: Story = {
  render: () => {
    const icons: {
      key: string;
      off: ChoiceIconName;
      on: ChoiceIconName;
      control?: React.ComponentProps<typeof Switch.Control>["xstyle"];
      iconStyle?: React.ComponentProps<typeof Switch.Control>["xstyle"];
    }[] = [
      {
        key: "lock",
        off: "volume-fill",
        on: "volume-slash-fill",
        control: s.blue,
        iconStyle: s.blueIcon,
      },
      {
        key: "microphone",
        off: "microphone",
        on: "microphone-slash",
        control: s.red,
        iconStyle: s.redIcon,
      },
      { key: "check", off: "power", on: "check", control: s.green, iconStyle: s.greenIcon },
      { key: "darkMode", off: "moon", on: "sun" },
      {
        key: "notification",
        off: "bell-slash",
        on: "bell-fill",
        control: s.purple,
        iconStyle: s.purpleIcon,
      },
    ];
    return (
      <div {...stylex.props(s.icons)}>
        {icons.map((icon) => (
          <SwitchItem
            key={icon.key}
            defaultChecked
            aria-label={icon.key}
            label={null}
            size="lg"
            controlStyle={(checked) => (checked ? icon.control : undefined)}
            thumb={(checked) => (
              <Switch.Icon>
                <ChoiceIcon
                  name={checked ? icon.on : icon.off}
                  {...stylex.props(s.switchIcon, checked && icon.iconStyle)}
                />
              </Switch.Icon>
            )}
          />
        ))}
      </div>
    );
  },
};
export const RenderProps: Story = {
  render: () => <SwitchItem label={(checked) => (checked ? "Enabled" : "Disabled")} />,
};
// Existing local development states are retained separately from the source stories.
export const LocalEmailUnchecked: Story = {
  render: () => <SwitchItem label="Email notifications" />,
};
export const LocalEmailChecked: Story = {
  render: () => <SwitchItem defaultChecked label="Email notifications" />,
};
export const LocalEmailDisabled: Story = {
  render: () => <SwitchItem disabled label="Email notifications" />,
};
export const LocalEmailSmall: Story = {
  render: () => <SwitchItem size="sm" label="Email notifications" />,
};
export const LocalEmailLarge: Story = {
  render: () => <SwitchItem size="lg" label="Email notifications" />,
};
