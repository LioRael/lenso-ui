// Adapted from HeroUI v3.2.6 meter.stories.tsx (Apache-2.0).
// Use the native Base UI label and min/max bounds.
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { Meter } from "@lenso/ui";

const styles = stylex.create({
  frame: { width: 384, padding: 32 },
  stack: { display: "flex", width: "100%", flexDirection: "column", gap: 24 },
});
const meta: Meta<typeof Meter> = {
  title: "Components/Feedback/Meter",
  component: Meter,
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
  render: (args: Partial<ComponentProps<typeof Meter>>) => (
    <Meter value={60} {...args}>
      <Meter.Label>Storage</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  ),
};
export default meta;
type Story = StoryObj<Partial<ComponentProps<typeof Meter>>>;
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
        <Meter key={size} size={size} value={value} {...args}>
          <Meter.Label>{label}</Meter.Label>
          <Meter.Output />
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
      ))}
    </div>
  ),
};
export const Colors: Story = {
  render: (args) => (
    <div {...stylex.props(styles.stack)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <Meter key={color} color={color} value={50} {...args}>
          <Meter.Label>
            {color[0]?.toUpperCase()}
            {color.slice(1)}
          </Meter.Label>
          <Meter.Output />
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
      ))}
    </div>
  ),
};
export const CustomValue: Story = {
  render: (args) => (
    <Meter format={{ style: "currency", currency: "USD" }} max={1000} min={0} value={750} {...args}>
      <Meter.Label>Revenue</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  ),
};
export const WithoutLabel: Story = {
  render: (args) => (
    <Meter aria-label="Storage usage" value={45} {...args}>
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  ),
};
