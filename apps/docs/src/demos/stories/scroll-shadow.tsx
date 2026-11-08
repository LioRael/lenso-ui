"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ScrollShadowStoryProps extends Pick<
  StoryComponentProps<typeof ScrollShadow>,
  "orientation" | "variant"
> {}
export const initialArgs: ScrollShadowStoryProps = /* story-args:start */ {
  orientation: "vertical",
  variant: "fade",
}; /* story-args:end */

import { ScrollShadow } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: { width: "100%", maxWidth: { default: null, "@media (min-width: 640px)": 384 } },
  scroll: { maxHeight: 240, padding: 16 },
  paragraphs: { display: "flex", flexDirection: "column", gap: 16 },
});
export function Default(overrides: ScrollShadowStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.root)}>
      <ScrollShadow
        tabIndex={0}
        aria-label="Scrollable sample text"
        xstyle={styles.scroll}
        {...args}
      >
        <div {...stylex.props(styles.paragraphs)}>
          {Array.from({ length: 10 }, (_, index) => (
            <p key={index}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
              risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.
              Morbi accumsan cursus enim, sed ultricies sapien.
            </p>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}
export default Default;
