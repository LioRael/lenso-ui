// SPDX-License-Identifier: Apache-2.0. See ../../../THIRD_PARTY_NOTICES.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@lenso/ui";
import { SwitchItem } from "./choice-fixtures";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Compositions/SwitchLayouts",
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <fieldset aria-label="Notification preferences" {...stylex.props(groupStyles.root)}>
      <SwitchItem name="notifications" label="Allow Notifications" />
      <SwitchItem name="marketing" label="Marketing emails" />
      <SwitchItem name="social" label="Social media updates" />
    </fieldset>
  ),
};
export const Horizontal: Story = {
  render: () => (
    <fieldset
      aria-label="Notification preferences"
      {...stylex.props(groupStyles.root, groupStyles.horizontal, s.overflow)}
    >
      <SwitchItem name="notifications" label="Notifications" />
      <SwitchItem name="marketing" label="Marketing" />
      <SwitchItem name="social" label="Social" />
    </fieldset>
  ),
};
export const Form: Story = {
  render: function SwitchForm() {
    return (
      <form
        {...stylex.props(s.column)}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          alert(
            `Form submitted with:\n${Array.from(formData.entries())
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}`,
          );
        }}
      >
        <fieldset aria-label="Notification preferences" {...stylex.props(groupStyles.root)}>
          <SwitchItem name="notifications" value="on" label="Enable notifications" />
          <SwitchItem defaultChecked name="newsletter" value="on" label="Subscribe to newsletter" />
          <SwitchItem name="marketing" value="on" label="Receive marketing updates" />
        </fieldset>
        <Button size="sm" type="submit" variant="prominent">
          Submit
        </Button>
      </form>
    );
  },
};

const groupStyles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  horizontal: { flexDirection: "row" },
});
