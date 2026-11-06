"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface TypographyStoryProps extends Pick<
  StoryComponentProps<typeof Typography>,
  "color" | "align" | "weight"
> {}
export const initialArgs: TypographyStoryProps = /* story-args:start */ {
  color: "default",
  align: "start",
  weight: "normal",
}; /* story-args:end */

import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 576 },
});

export function Default(overrides: TypographyStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.column)}>
      <Typography type="h1" {...args}>
        Build better interfaces
      </Typography>
      <Typography type="h2">Typography that stays semantic</Typography>
      <Typography type="h3">Composable by default</Typography>
      <Typography type="h4">Small heading</Typography>
      <Typography>
        Lenso UI Typography provides semantic typography types and native element composition.
      </Typography>
      <Typography color="muted" type="body-sm">
        Smaller muted body copy for secondary descriptions.
      </Typography>
      <Typography type="code">bun add @lenso/ui</Typography>
    </div>
  );
}
