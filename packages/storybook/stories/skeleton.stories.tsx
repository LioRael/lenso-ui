// Adapted from HeroUI v3.2.6 skeleton.stories.tsx (Apache-2.0).
// A Skeleton parent replaces the upstream CSS descendant shimmer contract.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Skeleton } from "@lenso/ui";

const styles = stylex.create({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    backgroundColor: "var(--surface)",
    width: 200,
    borderRadius: 24,
    padding: 16,
    boxShadow: "var(--shadow-surface)",
  },
  lines: { display: "flex", flexDirection: "column", gap: 12 },
  image: { height: 96, borderRadius: 12 },
  line: { height: 12, borderRadius: 8 },
  three: { width: "60%" },
  four: { width: "80%" },
  two: { width: "40%" },
  grid: { display: "grid", width: 450, gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  shimmer: { position: "relative", overflow: "hidden", borderRadius: 12 },
});
const meta = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  argTypes: { animationType: { control: "select", options: ["shimmer", "pulse", "none"] } },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <div {...stylex.props(styles.card)}>
      <Skeleton {...args} xstyle={[styles.image, args.xstyle]} />
      <div {...stylex.props(styles.lines)}>
        <Skeleton {...args} xstyle={[styles.line, styles.three, args.xstyle]} />
        <Skeleton {...args} xstyle={[styles.line, styles.four, args.xstyle]} />
        <Skeleton {...args} xstyle={[styles.line, styles.two, args.xstyle]} />
      </div>
    </div>
  ),
};
export const Grid: Story = {
  render: (args) => (
    <div {...stylex.props(styles.grid)}>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} {...args} xstyle={[styles.image, args.xstyle]} />
      ))}
    </div>
  ),
};
export const SingleShimmer: Story = {
  args: { animationType: "none" },
  render: (args) => (
    <Skeleton animationType="shimmer" xstyle={[styles.grid, styles.shimmer]}>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} {...args} xstyle={[styles.image, args.xstyle]} />
      ))}
    </Skeleton>
  ),
};
