import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@lenso/ui";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { isLoading: true, children: "Saving changes" } };
export const Secondary: Story = { args: { variant: "secondary" } };
