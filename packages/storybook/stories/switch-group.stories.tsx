// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { SwitchGroup, Button } from "@lenso/ui";
import { SwitchItem } from "./choice-fixtures";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Components/SwitchGroup",
  component: SwitchGroup,
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta<typeof SwitchGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <SwitchGroup>
      <SwitchItem name="notifications" label="Allow Notifications" />
      <SwitchItem name="marketing" label="Marketing emails" />
      <SwitchItem name="social" label="Social media updates" />
    </SwitchGroup>
  ),
};
export const Horizontal: Story = {
  render: () => (
    <SwitchGroup orientation="horizontal" xstyle={s.overflow}>
      <SwitchItem name="notifications" label="Notifications" />
      <SwitchItem name="marketing" label="Marketing" />
      <SwitchItem name="social" label="Social" />
    </SwitchGroup>
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
        <SwitchGroup>
          <SwitchItem name="notifications" value="on" label="Enable notifications" />
          <SwitchItem defaultChecked name="newsletter" value="on" label="Subscribe to newsletter" />
          <SwitchItem name="marketing" value="on" label="Receive marketing updates" />
        </SwitchGroup>
        <Button size="sm" type="submit" variant="primary">
          Submit
        </Button>
      </form>
    );
  },
};
