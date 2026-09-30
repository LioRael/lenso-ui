// Adapted from HeroUI v3.2.6 textarea.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { TextArea, Surface } from "@lenso/ui";

const styles = stylex.create({
  variants: { display: "flex", width: 280, flexDirection: "column", gap: 8 },
  full: { display: "flex", width: 400, flexDirection: "column", gap: 12 },
  surface: { width: "100%", borderRadius: 24, padding: 24 },
});
const meta = { title: "Components/Forms/Textarea", component: TextArea } satisfies Meta<
  typeof TextArea
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => <TextArea aria-label="Describe your product" placeholder="Describe your product" />,
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.variants)}>
      <TextArea
        fullWidth
        aria-label="Primary textarea"
        placeholder="Primary textarea"
        variant="primary"
      />
      <TextArea
        fullWidth
        aria-label="Secondary textarea"
        placeholder="Secondary textarea"
        variant="secondary"
      />
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(styles.full)}>
      <TextArea fullWidth aria-label="Full width textarea" placeholder="Full width textarea" />
      <Surface xstyle={styles.surface}>
        <TextArea
          fullWidth
          aria-label="Full width textarea on surface"
          placeholder="Full width textarea on surface"
          variant="secondary"
        />
      </Surface>
    </div>
  ),
};
