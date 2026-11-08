"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface InputGroupStoryProps extends Pick<
  StoryComponentProps<typeof InputGroup>,
  "variant" | "fullWidth" | "glass" | "elastic"
> {}
export const initialArgs: InputGroupStoryProps = /* story-args:start */ {
  variant: "primary",
  fullWidth: false,
  glass: false,
  elastic: false,
}; /* story-args:end */

import { Envelope } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  icon: { width: 16, height: 16, color: "var(--lenso-label-secondary)" },
});

export function Default(overrides: InputGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>Email address</Label>
      <InputGroup {...args}>
        <InputGroup.Prefix>
          <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
      </InputGroup>
    </TextField>
  );
}
