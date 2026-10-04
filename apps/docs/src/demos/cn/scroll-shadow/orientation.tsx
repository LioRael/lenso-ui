// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Card, ScrollShadow } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const images = [
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/robot1.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/avocado.jpeg",
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/oranges.jpeg",
];
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: {
      default: null,
      "@media (min-width: 640px)": 384,
    },
  },
  vertical: {
    marginBottom: 32,
    width: "100%",
  },
  heading: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 600,
  },
  card: {
    width: "100%",
    padding: 0,
  },
  verticalScroll: {
    maxHeight: 240,
    padding: 16,
  },
  horizontalScroll: {
    padding: 16,
  },
  paragraphs: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cards: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  item: {
    display: "flex",
    minWidth: 200,
    flexDirection: "row",
    gap: 12,
    padding: 4,
  },
  image: {
    aspectRatio: "1",
    width: {
      default: 64,
      "@media (min-width: 640px)": 80,
    },
    height: {
      default: 64,
      "@media (min-width: 640px)": 80,
    },
    flexShrink: 0,
    borderRadius: "var(--radius-xl)",
    objectFit: "cover",
    userSelect: "none",
  },
  text: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
  },
  title: {
    fontSize: 14,
  },
  description: {
    fontSize: 12,
  },
});
export default function Orientation() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.vertical)}>
        <h4 {...stylex.props(styles.heading)}>垂直</h4>
        <Card xstyle={styles.card}>
          <ScrollShadow
            tabIndex={0}
            aria-label="Vertical sample"
            xstyle={styles.verticalScroll}
            orientation="vertical"
          >
            <div {...stylex.props(styles.paragraphs)}>
              {Array.from(
                {
                  length: 10,
                },
                (_, index) => (
                  <p key={index}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus
                    non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed
                    porttitor quam. Morbi accumsan cursus enim, sed ultricies sapien.
                  </p>
                ),
              )}
            </div>
          </ScrollShadow>
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(styles.heading)}>水平</h4>
        <Card xstyle={styles.card}>
          <ScrollShadow
            tabIndex={0}
            aria-label="Horizontal cards"
            xstyle={styles.horizontalScroll}
            orientation="horizontal"
          >
            <div {...stylex.props(styles.cards)}>
              {Array.from(
                {
                  length: 10,
                },
                (_, index) => (
                  <Card key={index} xstyle={styles.item} variant="transparent">
                    <img
                      alt="示例卡片"
                      {...stylex.props(styles.image)}
                      loading="lazy"
                      src={images[index % images.length]}
                    />
                    <div {...stylex.props(styles.text)}>
                      <Card.Title xstyle={styles.title}>连接未来</Card.Title>
                      <Card.Description xstyle={styles.description}>今天 18:30</Card.Description>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </ScrollShadow>
        </Card>
      </div>
    </div>
  );
}
