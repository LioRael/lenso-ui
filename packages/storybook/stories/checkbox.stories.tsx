import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@lenso/ui";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Include archived projects" },
  render: (args) => (
    <Checkbox {...args}>
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>Include archived projects</Checkbox.Content>
    </Checkbox>
  ),
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Disabled: Story = { args: { disabled: true } };
