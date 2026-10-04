// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Checkbox, CheckboxGroup } from "@lenso/ui";
import { CheckboxItem, ChoiceHeading, ChoiceHelp } from "./choice-fixtures";
import { ChoiceIcon, type ChoiceIconName } from "./choice-icons";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <CheckboxItem name="terms" label="Accept terms and conditions" />,
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.column, s.padded)}>
      <div {...stylex.props(s.compact)}>
        <p {...stylex.props(s.heading)}>Primary variant</p>
        <CheckboxItem
          name="primary"
          variant="primary"
          label="Primary checkbox"
          description="Standard styling with default background"
        />
      </div>
      <div {...stylex.props(s.compact)}>
        <p {...stylex.props(s.heading)}>Secondary variant</p>
        <CheckboxItem
          name="secondary"
          variant="secondary"
          label="Secondary checkbox"
          description="Lower emphasis variant for use in surfaces"
        />
      </div>
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <CheckboxItem
      name="terms"
      label="Accept terms and conditions"
      description="I agree to the terms and privacy policy"
    />
  ),
};
export const WithCustomIndicator: Story = {
  render: () => (
    <div {...stylex.props(s.customChecks, s.padded)}>
      <CheckboxItem defaultChecked id="heart" label="Heart" indicator="heart" />
      <CheckboxItem defaultChecked id="plus" label="Plus" indicator="plus" />
      <CheckboxItem indeterminate id="indeterminate" label="Indeterminate" indicator="dash" />
    </div>
  ),
};
export const Indeterminate: Story = {
  render: () => (
    <CheckboxItem
      indeterminate
      id="select-all"
      label="Select all"
      description="Shows indeterminate state"
    />
  ),
};
export const ControlOnly: Story = {
  render: () => <CheckboxItem aria-label="Accept" name="control-only" label={null} />,
};
export const Disabled: Story = {
  render: () => (
    <CheckboxItem disabled id="feature" label="Feature" description="This feature is coming soon" />
  ),
};
export const Controlled: Story = {
  render: function ControlledCheckbox() {
    const [checked, setChecked] = React.useState(true);
    return (
      <div {...stylex.props(s.controlledColumn, s.padded)}>
        <CheckboxItem
          id="notifications"
          checked={checked}
          onCheckedChange={setChecked}
          label="Email notifications"
        />
        <p {...stylex.props(s.status)}>
          Status: <strong>{checked ? "Enabled" : "Disabled"}</strong>
        </p>
      </div>
    );
  },
};
export const RenderProps: Story = {
  render: () => (
    <CheckboxItem
      id="terms"
      label={(checked) => (checked ? "Terms accepted" : "Accept terms")}
      description={(checked) =>
        checked ? "Thank you for accepting" : "Please read and accept the terms"
      }
    />
  ),
};
export const Invalid: Story = {
  render: () => (
    <CheckboxItem
      invalid
      required
      name="agreement"
      label="I agree to the terms"
      error="You must accept the terms to continue"
    />
  ),
};
export const Validation: Story = {
  render: () => (
    <CheckboxItem
      required
      name="newsletter"
      validate={(checked) => (checked ? null : "Please subscribe to continue")}
      error="Please subscribe to continue"
      label="Subscribe to newsletter"
    />
  ),
};
export const FullRounded: Story = {
  render: () => (
    <div {...stylex.props(s.roundedColumn, s.padded)}>
      <span {...stylex.props(s.heading)}>Rounded checkboxes</span>
      <CheckboxItem id="small-rounded" roundedSize="small" label="Small size" />
      <CheckboxItem id="default-rounded" roundedSize="medium" label="Default size" />
      <CheckboxItem id="large-rounded" roundedSize="large" label="Large size" />
      <CheckboxItem id="xl-rounded" roundedSize="extraLarge" label="Extra large size" />
    </div>
  ),
};
export const FeaturesAndAddOnsExample: Story = {
  render: function FeaturesAndAddOns() {
    const id = React.useId();
    const addOns: { title: string; value: string; description: string; icon: ChoiceIconName }[] = [
      {
        title: "Email Notifications",
        value: "email",
        description: "Receive updates via email",
        icon: "envelope",
      },
      {
        title: "SMS Alerts",
        value: "sms",
        description: "Get instant SMS notifications",
        icon: "comment",
      },
      {
        title: "Push Notifications",
        value: "push",
        description: "Browser and mobile push alerts",
        icon: "bell",
      },
    ];
    return (
      <div {...stylex.props(s.showcase)}>
        <section {...stylex.props(s.section, s.minWidth)}>
          <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
            <ChoiceHeading id={`${id}-label`}>Notification preferences</ChoiceHeading>
            <ChoiceHelp id={`${id}-help`}>Choose how you want to receive updates</ChoiceHelp>
            <div {...stylex.props(s.compact)}>
              {addOns.map((addon) => (
                <CheckboxItem
                  key={addon.value}
                  id={addon.value}
                  name="notification-preferences"
                  value={addon.value}
                  label={addon.title}
                  description={addon.description}
                  card="addon"
                  icon={<ChoiceIcon name={addon.icon} {...stylex.props(s.cardIcon)} />}
                />
              ))}
            </div>
          </CheckboxGroup>
        </section>
      </div>
    );
  },
};
// Existing local development states are not upstream parity exports.
export const LocalArchivedUnchecked: Story = {
  render: () => <CheckboxItem label="Include archived projects" />,
};
export const LocalArchivedChecked: Story = {
  render: () => <CheckboxItem defaultChecked label="Include archived projects" />,
};
export const LocalArchivedIndeterminate: Story = {
  render: () => <CheckboxItem indeterminate label="Include archived projects" />,
};
export const LocalArchivedDisabled: Story = {
  render: () => <CheckboxItem disabled label="Include archived projects" />,
};
