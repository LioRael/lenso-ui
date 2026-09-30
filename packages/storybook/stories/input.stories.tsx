// Adapted from HeroUI v3.2.6 input.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Input, Surface } from "@lenso/ui";

const styles = stylex.create({
  variants: { display: "flex", width: 240, flexDirection: "column", gap: 8 },
  full: { display: "flex", width: 400, flexDirection: "column", gap: 12 },
  canvas: {
    display: "flex",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    padding: 16,
  },
  width: { width: "100%" },
  stack: { display: "flex", flexDirection: "column", gap: 32 },
  sample: { display: "flex", flexDirection: "column", gap: 8 },
  caption: { fontSize: 14, fontWeight: 500, color: "var(--muted)" },
  surface: {
    display: "flex",
    minWidth: 320,
    flexDirection: "column",
    gap: 12,
    borderRadius: 24,
    padding: 24,
  },
  border: { borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)" },
});
const meta = { title: "Components/Forms/Input", component: Input } satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <Input aria-label="Your name" placeholder="Your name" />,
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.variants)}>
      <Input fullWidth aria-label="Primary input" placeholder="Primary input" variant="primary" />
      <Input
        fullWidth
        aria-label="Secondary input"
        placeholder="Secondary input"
        variant="secondary"
      />
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(styles.full)}>
      <Input fullWidth aria-label="Full width input" placeholder="Full width input" />
      <div {...stylex.props(styles.canvas)}>
        <Surface xstyle={styles.width}>
          <Input
            fullWidth
            aria-label="Full width input on surface"
            placeholder="Full width input on surface"
            variant="secondary"
          />
        </Surface>
      </div>
    </div>
  ),
};
export const OnSurfaces: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      {(["default", "secondary", "tertiary", "transparent"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.sample)}>
          <p {...stylex.props(styles.caption)}>
            {variant[0]?.toUpperCase()}
            {variant.slice(1)} Surface
          </p>
          <Surface
            variant={variant}
            xstyle={[styles.surface, variant === "transparent" && styles.border]}
          >
            <Input
              aria-label="Your name primary"
              xstyle={styles.width}
              placeholder="Your name"
              variant="primary"
            />
            <Input
              aria-label="Your name secondary"
              xstyle={styles.width}
              placeholder="Your name"
              variant="secondary"
            />
          </Surface>
        </div>
      ))}
    </div>
  ),
};
