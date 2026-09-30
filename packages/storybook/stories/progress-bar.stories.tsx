// Adapted from HeroUI v3.2.6 progress-bar.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { ProgressBar } from "@lenso/ui";

const styles = stylex.create({
  frame: { width: 384, padding: 32 },
  stack: { display: "flex", width: "100%", flexDirection: "column", gap: 24 },
});
const meta: Meta<typeof ProgressBar> = {
  title: "Components/Feedback/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["default", "accent", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div {...stylex.props(styles.frame)}>
        <Story />
      </div>
    ),
  ],
  render: (args: Partial<ComponentProps<typeof ProgressBar>>) => (
    <ProgressBar value={60} {...args}>
      <ProgressBar.Label>Loading</ProgressBar.Label>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  ),
};
export default meta;
type Story = StoryObj<Partial<ComponentProps<typeof ProgressBar>>>;
export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div {...stylex.props(styles.stack)}>
      {(
        [
          ["sm", 40, "Small"],
          ["md", 60, "Medium"],
          ["lg", 80, "Large"],
        ] as const
      ).map(([size, value, label]) => (
        <ProgressBar key={size} size={size} value={value} {...args}>
          <ProgressBar.Label>{label}</ProgressBar.Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      ))}
    </div>
  ),
};
export const Colors: Story = {
  render: (args) => (
    <div {...stylex.props(styles.stack)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <ProgressBar key={color} color={color} value={50} {...args}>
          <ProgressBar.Label>
            {color[0]?.toUpperCase()}
            {color.slice(1)}
          </ProgressBar.Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      ))}
    </div>
  ),
};
export const Indeterminate: Story = {
  render: (args) => (
    <ProgressBar value={null} {...args}>
      <ProgressBar.Label>Loading...</ProgressBar.Label>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  ),
};
export const CustomValue: Story = {
  render: (args) => (
    <ProgressBar
      format={{ style: "currency", currency: "USD" }}
      max={1000}
      min={0}
      value={750}
      {...args}
    >
      <ProgressBar.Label>Revenue</ProgressBar.Label>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  ),
};
export const WithoutLabel: Story = {
  render: (args) => (
    <ProgressBar aria-label="Loading progress" value={45} {...args}>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  ),
};
