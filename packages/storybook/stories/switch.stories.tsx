import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@lenso/ui";

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { "aria-label": "Email notifications" },
  render: (args) => (
    <Switch {...args}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>Email notifications</Switch.Content>
    </Switch>
  ),
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
