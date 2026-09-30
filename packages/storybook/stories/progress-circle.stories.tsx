// Adapted from HeroUI v3.2.6 progress-circle.stories.tsx (Apache-2.0).
// Base UI represents indeterminate progress with value=null, not isIndeterminate.
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { ProgressCircle } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 24 },
  labelRow: { display: "flex", alignItems: "center", gap: 12 },
});
const meta = {
  title: "Components/Feedback/ProgressCircle",
  component: ProgressCircle,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "select", options: ["default", "accent", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  render: (args: Partial<ComponentProps<typeof ProgressCircle>>) => (
    <ProgressCircle aria-label="Loading" value={60} {...args}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  ),
} satisfies Meta<typeof ProgressCircle>;
export default meta;
type Story = StoryObj<Partial<ComponentProps<typeof ProgressCircle>>>;
export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["sm", 40],
          ["md", 60],
          ["lg", 80],
        ] as const
      ).map(([size, value]) => (
        <ProgressCircle key={size} aria-label="Loading" size={size} value={value} {...args}>
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
      ))}
    </div>
  ),
};
export const Colors: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <ProgressCircle key={color} aria-label="Loading" color={color} value={60} {...args}>
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
      ))}
    </div>
  ),
};
export const Indeterminate: Story = { args: { value: null } };
export const WithLabel: Story = {
  render: (args) => (
    <div {...stylex.props(styles.labelRow)}>
      <ProgressCircle aria-label="Loading" value={75} {...args}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <span>75% Complete</span>
    </div>
  ),
};
