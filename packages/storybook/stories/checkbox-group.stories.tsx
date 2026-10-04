// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { CheckboxGroup, Button, Form, TextField, FieldError } from "@lenso/ui";
import { CheckboxItem, ChoiceHeading, ChoiceHelp } from "./choice-fixtures";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta<typeof CheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
const skills = ["coding", "design", "writing"];
const descriptions = [
  "Love building software",
  "Enjoy creating beautiful interfaces",
  "Passionate about content creation",
];

export const Default: Story = {
  render: function Interests() {
    const id = React.useId();
    return (
      <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
        <ChoiceHeading id={`${id}-label`}>Select your interests</ChoiceHeading>
        <ChoiceHelp id={`${id}-help`}>Choose all that apply</ChoiceHelp>
        {skills.map((value, i) => (
          <CheckboxItem
            key={value}
            name="interests"
            value={value}
            label={value[0]!.toUpperCase() + value.slice(1)}
            description={descriptions[i]}
          />
        ))}
      </CheckboxGroup>
    );
  },
};
export const WithCustomIndicator: Story = {
  render: function Features() {
    const id = React.useId();
    return (
      <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
        <ChoiceHeading id={`${id}-label`}>Features</ChoiceHeading>
        <ChoiceHelp id={`${id}-help`}>Select the features you want</ChoiceHelp>
        <CheckboxItem
          name="features"
          value="notifications"
          label="Email notifications"
          description="Receive updates via email"
          indicator="cross"
        />
        <CheckboxItem
          name="features"
          value="newsletter"
          label="Newsletter"
          description="Get weekly newsletters"
          indicator="cross"
        />
      </CheckboxGroup>
    );
  },
};
export const Indeterminate: Story = {
  render: function SelectAll() {
    const [selected, setSelected] = React.useState(["coding"]);
    return (
      <div>
        <CheckboxItem
          name="select-all"
          label="Select all"
          indeterminate={selected.length > 0 && selected.length < skills.length}
          checked={selected.length === skills.length}
          onCheckedChange={(checked) => setSelected(checked ? skills : [])}
        />
        <div {...stylex.props(s.indent)}>
          <CheckboxGroup value={selected} onValueChange={setSelected} aria-label="Interests">
            {skills.map((value) => (
              <CheckboxItem
                key={value}
                value={value}
                label={value[0]!.toUpperCase() + value.slice(1)}
              />
            ))}
          </CheckboxGroup>
        </div>
      </div>
    );
  },
};
export const Validation: Story = {
  render: function PreferencesForm() {
    const id = React.useId();
    return (
      <Form
        xstyle={[s.column, s.padded]}
        onSubmit={(event) => {
          event.preventDefault();
          alert(
            `Selected preferences: ${new FormData(event.currentTarget).getAll("preferences").join(", ")}`,
          );
        }}
      >
        <TextField
          name="preferences"
          validate={(value) =>
            Array.isArray(value) && value.length > 0
              ? null
              : "Please select at least one notification method."
          }
        >
          <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
            <ChoiceHeading id={`${id}-label`}>Preferences</ChoiceHeading>
            <ChoiceHelp id={`${id}-help`}>Select at least one preference</ChoiceHelp>
            <CheckboxItem name="preferences" value="email" label="Email notifications" />
            <CheckboxItem name="preferences" value="sms" label="SMS notifications" />
            <CheckboxItem name="preferences" value="push" label="Push notifications" />
            <FieldError>Please select at least one notification method.</FieldError>
          </CheckboxGroup>
        </TextField>
        <Button type="submit">Submit</Button>
      </Form>
    );
  },
};
export const Controlled: Story = {
  render: function ControlledSkills() {
    const [selected, setSelected] = React.useState(["coding", "design"]);
    const id = React.useId();
    return (
      <CheckboxGroup
        xstyle={s.minWidth}
        value={selected}
        onValueChange={setSelected}
        aria-labelledby={`${id}-label`}
      >
        <ChoiceHeading id={`${id}-label`}>Your skills</ChoiceHeading>
        {skills.map((value) => (
          <CheckboxItem
            key={value}
            name="skills"
            value={value}
            label={value[0]!.toUpperCase() + value.slice(1)}
          />
        ))}
        <span {...stylex.props(s.status)}>Selected: {selected.join(", ") || "None"}</span>
      </CheckboxGroup>
    );
  },
};
export const Disabled: Story = {
  render: function DisabledFeatures() {
    const id = React.useId();
    return (
      <CheckboxGroup disabled aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
        <ChoiceHeading id={`${id}-label`}>Features</ChoiceHeading>
        <ChoiceHelp id={`${id}-help`}>Feature selection is temporarily disabled</ChoiceHelp>
        <CheckboxItem
          name="disabled-features"
          value="feature1"
          label="Feature 1"
          description="This feature is coming soon"
        />
        <CheckboxItem
          name="disabled-features"
          value="feature2"
          label="Feature 2"
          description="This feature is coming soon"
        />
      </CheckboxGroup>
    );
  },
};
