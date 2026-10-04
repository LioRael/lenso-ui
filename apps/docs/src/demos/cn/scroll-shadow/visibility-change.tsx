// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Card, ScrollShadow, type ScrollShadowVisibility } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const VISIBILITY_LABELS = {
  auto: "自动",
  both: "两侧",
  bottom: "底部",
  left: "左侧",
  none: "无",
  right: "右侧",
  top: "顶部",
};
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
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  vertical: {
    marginBottom: 32,
  },
  status: {
    borderRadius: "var(--radius)",
    backgroundColor: "var(--default)",
    padding: 16,
  },
  statusText: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 600,
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
export default function VisibilityChange() {
  const [verticalState, setVerticalState] = useState<ScrollShadowVisibility>("none");
  const [horizontalState, setHorizontalState] = useState<ScrollShadowVisibility>("none");
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section, styles.vertical)}>
        <div {...stylex.props(styles.status)}>
          <p {...stylex.props(styles.statusText)}>
            Vertical Shadow State: {VISIBILITY_LABELS[verticalState]}
          </p>
        </div>
        <ScrollShadow
          tabIndex={0}
          aria-label="Vertical sample"
          xstyle={styles.verticalScroll}
          orientation="vertical"
          onVisibilityChange={setVerticalState}
        >
          <div {...stylex.props(styles.paragraphs)}>
            {Array.from(
              {
                length: 10,
              },
              (_, index) => (
                <p key={index}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                  risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                  quam. Morbi accumsan cursus enim, sed ultricies sapien.
                </p>
              ),
            )}
          </div>
        </ScrollShadow>
      </div>
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.status)}>
          <p {...stylex.props(styles.statusText)}>
            Horizontal Shadow State: {VISIBILITY_LABELS[horizontalState]}
          </p>
        </div>
        <ScrollShadow
          tabIndex={0}
          aria-label="Horizontal cards"
          xstyle={styles.horizontalScroll}
          orientation="horizontal"
          onVisibilityChange={setHorizontalState}
        >
          <div {...stylex.props(styles.cards)}>
            {Array.from(
              {
                length: 10,
              },
              (_, index) => (
                <Card key={index} xstyle={styles.item} variant="transparent">
                  <img
                    alt="Lorem Card"
                    {...stylex.props(styles.image)}
                    loading="lazy"
                    src={images[index % images.length]}
                  />
                  <div {...stylex.props(styles.text)}>
                    <Card.Title xstyle={styles.title}>Bridging the Future</Card.Title>
                    <Card.Description xstyle={styles.description}>Today, 6:30 PM</Card.Description>
                  </div>
                </Card>
              ),
            )}
          </div>
        </ScrollShadow>
      </div>
    </div>
  );
}
