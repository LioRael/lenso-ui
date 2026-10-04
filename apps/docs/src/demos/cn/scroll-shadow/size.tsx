// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ScrollShadow } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: {
      default: null,
      "@media (min-width: 640px)": 384,
    },
  },
  scroll: {
    maxHeight: 240,
    padding: 16,
  },
  paragraphs: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
});
export default function CustomSize() {
  return (
    <div {...stylex.props(styles.root)}>
      <ScrollShadow
        size={80}
        tabIndex={0}
        aria-label="Scrollable sample text"
        xstyle={styles.scroll}
      >
        <div {...stylex.props(styles.paragraphs)}>
          {Array.from(
            {
              length: 10,
            },
            (_, index) => (
              <p key={index}>
                段落 {index + 1}：Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus,
                sed porttitor quam. Morbi accumsan cursus enim, sed ultricies sapien.
              </p>
            ),
          )}
        </div>
      </ScrollShadow>
    </div>
  );
}
