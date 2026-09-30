// Adapted from HeroUI v3.2.6 scroll-shadow.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { ScrollShadow, type ScrollShadowVisibility, Card, Button } from "@lenso/ui";

const styles = stylex.create({
  content: { display: "flex", flexDirection: "column", gap: 16 },
  cards: { display: "flex", flexDirection: "row", gap: 16 },
  card: { display: "flex", minWidth: 200, flexDirection: "row", gap: 12, padding: 4 },
  image: {
    aspectRatio: "1 / 1",
    height: { default: 64, "@media (min-width: 640px)": 80 },
    width: { default: 64, "@media (min-width: 640px)": 80 },
    flexShrink: 0,
    borderRadius: 12,
    objectFit: "cover",
    userSelect: "none",
  },
  cardContent: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
  },
  cardTitle: { fontSize: 14 },
  cardDescription: { fontSize: 12 },
  frame: {
    width: "100%",
    padding: 0,
    maxWidth: { default: null, "@media (min-width: 640px)": 384 },
  },
  shadow: { maxHeight: 240, padding: 16 },
  smallViewport: { maxHeight: 200 },
  horizontal: { padding: 16 },
  sections: { display: "flex", flexDirection: "column", gap: 32 },
  sizeSections: { display: "flex", flexDirection: "column", gap: 24 },
  heading: { marginBottom: 8, fontSize: 14, fontWeight: 600 },
  visibility: { display: "flex", flexDirection: "column", gap: 16 },
  verticalSection: { marginBottom: 16 },
  state: { borderRadius: 4, backgroundColor: "var(--default)", padding: 16 },
  stateText: { fontSize: 14, fontWeight: 600 },
  terms: { maxWidth: 400 },
  noPadding: { padding: 0 },
  termsViewport: { height: 300, paddingInline: 16 },
  footer: { marginTop: 16, display: "flex", flexDirection: "row", gap: 8 },
  button: { width: "100%" },
});
const meta = {
  title: "Components/Utilities/ScrollShadow",
  component: ScrollShadow,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollShadow>;
export default meta;
type Story = StoryObj<typeof meta>;
function LoremContent() {
  return (
    <div {...stylex.props(styles.content)}>
      {Array.from({ length: 10 }, (_, index) => (
        <p key={index}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus
          hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam. Morbi
          accumsan cursus enim, sed ultricies sapien.
        </p>
      ))}
    </div>
  );
}
const images = ["robot1.jpeg", "avocado.jpeg", "oranges.jpeg"];
function LoremCards() {
  return (
    <div {...stylex.props(styles.cards)}>
      {Array.from({ length: 10 }, (_, index) => (
        <Card key={index} xstyle={styles.card} variant="transparent">
          <img
            alt="Lorem Card"
            {...stylex.props(styles.image)}
            loading="lazy"
            src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/${images[index % images.length]}`}
          />
          <div {...stylex.props(styles.cardContent)}>
            <Card.Title xstyle={styles.cardTitle}>Bridging the Future</Card.Title>
            <Card.Description xstyle={styles.cardDescription}>Today, 6:30 PM</Card.Description>
          </div>
        </Card>
      ))}
    </div>
  );
}
export const Default: Story = {
  render: (args) => (
    <div {...stylex.props(styles.frame)}>
      <ScrollShadow {...args} xstyle={[styles.shadow, args.xstyle]}>
        <LoremContent />
      </ScrollShadow>
    </div>
  ),
};
export const Variants: Story = {
  render: (args) => (
    <div {...stylex.props(styles.sections)}>
      {["Fade (Opacity Effect)", "Blur (Blur Effect)"].map((label) => (
        <div key={label}>
          <h4 {...stylex.props(styles.heading)}>{label}</h4>
          <div {...stylex.props(styles.frame)}>
            <ScrollShadow {...args} xstyle={[styles.shadow, args.xstyle]}>
              <LoremContent />
            </ScrollShadow>
          </div>
        </div>
      ))}
    </div>
  ),
};
export const Orientation: Story = {
  render: (args) => (
    <div {...stylex.props(styles.sections)}>
      <div>
        <h4 {...stylex.props(styles.heading)}>Vertical</h4>
        <Card xstyle={styles.frame}>
          <ScrollShadow orientation="vertical" {...args} xstyle={[styles.shadow, args.xstyle]}>
            <LoremContent />
          </ScrollShadow>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>Horizontal</h4>
        <Card xstyle={styles.frame}>
          <ScrollShadow
            orientation="horizontal"
            {...args}
            xstyle={[styles.horizontal, args.xstyle]}
          >
            <LoremCards />
          </ScrollShadow>
        </Card>
      </div>
    </div>
  ),
};
export const HideScrollBar: Story = {
  render: (args) => (
    <div {...stylex.props(styles.frame)}>
      <ScrollShadow hideScrollBar {...args} xstyle={[styles.shadow, args.xstyle]}>
        <LoremContent />
      </ScrollShadow>
    </div>
  ),
};
export const CustomSize: Story = {
  render: (args) => (
    <div {...stylex.props(styles.sizeSections)}>
      {(
        [
          [20, "Small Shadow (20px)"],
          [undefined, "Default Shadow (40px)"],
          [80, "Large Shadow (80px)"],
        ] as const
      ).map(([size, label]) => (
        <div key={label}>
          <h4 {...stylex.props(styles.heading)}>{label}</h4>
          <div {...stylex.props(styles.frame)}>
            <ScrollShadow
              size={size}
              {...args}
              xstyle={[styles.shadow, styles.smallViewport, args.xstyle]}
            >
              <LoremContent />
            </ScrollShadow>
          </div>
        </div>
      ))}
    </div>
  ),
};
function Visibility({ args }: { args: ComponentProps<typeof ScrollShadow> }) {
  const [vertical, setVertical] = useState<ScrollShadowVisibility>("none");
  const [horizontal, setHorizontal] = useState<ScrollShadowVisibility>("none");
  return (
    <>
      <div {...stylex.props(styles.visibility, styles.verticalSection)}>
        <div {...stylex.props(styles.state)}>
          <p {...stylex.props(styles.stateText)}>Vertical Shadow State: {vertical}</p>
        </div>
        <div {...stylex.props(styles.frame)}>
          <ScrollShadow
            orientation="vertical"
            onVisibilityChange={setVertical}
            {...args}
            xstyle={[styles.shadow, args.xstyle]}
          >
            <LoremContent />
          </ScrollShadow>
        </div>
      </div>
      <div {...stylex.props(styles.visibility)}>
        <div {...stylex.props(styles.state)}>
          <p {...stylex.props(styles.stateText)}>Horizontal Shadow State: {horizontal}</p>
        </div>
        <div {...stylex.props(styles.frame)}>
          <ScrollShadow
            orientation="horizontal"
            onVisibilityChange={setHorizontal}
            {...args}
            xstyle={[styles.horizontal, args.xstyle]}
          >
            <LoremCards />
          </ScrollShadow>
        </div>
      </div>
    </>
  );
}
export const VisibilityChange: Story = { render: (args) => <Visibility args={args} /> };
export const WithCard: Story = {
  render: (args) => (
    <Card xstyle={styles.terms}>
      <Card.Header>
        <Card.Title>Terms and Conditions</Card.Title>
        <Card.Description>Please review before proceeding</Card.Description>
      </Card.Header>
      <Card.Content xstyle={styles.noPadding}>
        <ScrollShadow size={80} {...args} xstyle={[styles.termsViewport, args.xstyle]}>
          <LoremContent />
        </ScrollShadow>
      </Card.Content>
      <Card.Footer xstyle={styles.footer}>
        <Button xstyle={styles.button} variant="secondary">
          Cancel
        </Button>
        <Button xstyle={styles.button}>Accept</Button>
      </Card.Footer>
    </Card>
  ),
};
