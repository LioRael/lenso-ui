// Adapted from HeroUI v3.2.6 separator.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Separator } from "@lenso/ui";

const styles = stylex.create({
  frame: { maxWidth: 448 },
  intro: { display: "flex", flexDirection: "column", gap: 4 },
  heading: { fontSize: 16, fontWeight: 500 },
  subtitle: { fontSize: 14, color: "var(--muted)" },
  separator: { marginBlock: 16 },
  navigation: { fontSize: 14, display: "flex", height: 20, alignItems: "center", gap: 16 },
  card: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 448,
    gap: 16,
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    padding: 16,
    boxShadow: "var(--shadow-surface)",
  },
  item: { display: "flex", alignItems: "center", gap: 12 },
  image: { width: 48, height: 48 },
  content: { flexGrow: 1 },
  title: { fontSize: 14, fontWeight: 500 },
  variants: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
});
const meta = {
  title: "Components/Layout/Separator",
  component: Separator,
  argTypes: { orientation: { control: { type: "radio" }, options: ["horizontal", "vertical"] } },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;
function Navigation() {
  return (
    <div {...stylex.props(styles.navigation)}>
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  );
}
export const Default: Story = {
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.intro)}>
        <h4 {...stylex.props(styles.heading)}>HeroUI v3 Components</h4>
        <p {...stylex.props(styles.subtitle)}>Beautiful, fast and modern React UI library.</p>
      </div>
      <Separator xstyle={styles.separator} />
      <Navigation />
    </div>
  ),
};
export const Vertical: Story = { render: () => <Navigation /> };
const items = [
  {
    image: "bell-small.png",
    title: "Set Up Notifications",
    subtitle: "Receive account activity updates",
  },
  {
    image: "compass-small.png",
    title: "Set up Browser Extension",
    subtitle: "Connect your browser to your account",
  },
  {
    image: "mint-collective-small.png",
    title: "Mint Collectible",
    subtitle: "Create your first collectible",
  },
];
export const WithContent: Story = {
  render: () => (
    <div {...stylex.props(styles.card)}>
      {items.map((item, index) => (
        <div key={item.title}>
          <div {...stylex.props(styles.item)}>
            <img
              alt={item.title}
              {...stylex.props(styles.image)}
              src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/${item.image}`}
            />
            <div {...stylex.props(styles.content)}>
              <h4 {...stylex.props(styles.title)}>{item.title}</h4>
              <p {...stylex.props(styles.subtitle)}>{item.subtitle}</p>
            </div>
          </div>
          {index < items.length - 1 && <Separator xstyle={styles.separator} />}
        </div>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.variants)}>
      <div>Default Variant</div>
      <Separator variant="default" />
      <div>Secondary Variant</div>
      <Separator variant="secondary" />
      <div>Tertiary Variant</div>
      <Separator variant="tertiary" />
    </div>
  ),
};
