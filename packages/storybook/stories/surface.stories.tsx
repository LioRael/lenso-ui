// Adapted from HeroUI v3.2.6 surface.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Surface, TextField, Label, Input } from "@lenso/ui";

const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  sample: { display: "flex", flexDirection: "column", gap: 8 },
  caption: { fontSize: 14, fontWeight: 500, color: "var(--muted)" },
  panel: {
    display: "flex",
    minWidth: 320,
    flexDirection: "column",
    gap: 12,
    borderRadius: 24,
    padding: 24,
  },
  border: { borderWidth: 1, borderStyle: "solid", borderColor: "var(--border)" },
  heading: { fontSize: 16, fontWeight: 600, color: "var(--foreground)" },
  input: { width: 280 },
  inputBorder: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 20%, transparent)",
  },
  description: { fontSize: 14, color: "var(--muted)" },
});
const meta = { title: "Components/Layout/Surface", component: Surface } satisfies Meta<
  typeof Surface
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      {(["transparent", "default", "secondary", "tertiary"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.sample)}>
          <p {...stylex.props(styles.caption)}>
            {variant[0]?.toUpperCase()}
            {variant.slice(1)}
          </p>
          <Surface
            variant={variant}
            xstyle={[styles.panel, variant === "transparent" && styles.border]}
          >
            <h3 {...stylex.props(styles.heading)}>Surface Content</h3>
            <TextField name="email">
              <Label>Email</Label>
              <Input
                required
                type="email"
                variant={variant === "default" ? "secondary" : "primary"}
                xstyle={[styles.input, variant === "default" && styles.inputBorder]}
                placeholder="john@example.com"
              />
            </TextField>
            <p {...stylex.props(styles.description)}>
              {variant === "transparent" || variant === "default"
                ? "This is a default surface variant. It uses bg-surface styling."
                : `This is a ${variant} surface variant. It uses bg-surface-${variant} styling.`}
            </p>
          </Surface>
        </div>
      ))}
    </div>
  ),
};
