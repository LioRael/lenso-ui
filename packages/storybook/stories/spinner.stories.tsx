// Adapted from HeroUI v3.2.6 spinner.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Spinner } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 32 },
  sample: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  caption: { fontSize: 12, color: "var(--muted)" },
});
const meta = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  argTypes: {
    color: { control: "select", options: ["accent", "current", "danger", "success", "warning"] },
    size: { control: "select", options: ["lg", "md", "sm", "xl"] },
  },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Colors: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {(["accent", "current", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} {...stylex.props(styles.sample)}>
          <Spinner color={color} {...args} />
          <span {...stylex.props(styles.caption)}>
            {color[0]?.toUpperCase()}
            {color.slice(1)}
          </span>
        </div>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["sm", "Small"],
          ["md", "Medium"],
          ["lg", "Large"],
          ["xl", "Extra Large"],
        ] as const
      ).map(([size, label]) => (
        <div key={size} {...stylex.props(styles.sample)}>
          <Spinner size={size} {...args} />
          <span {...stylex.props(styles.caption)}>{label}</span>
        </div>
      ))}
    </div>
  ),
};
