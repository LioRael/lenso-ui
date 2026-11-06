"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface TextAreaStoryProps extends Pick<
  StoryComponentProps<typeof TextArea>,
  "disabled" | "required" | "readOnly" | "variant" | "fullWidth"
> {
  placeholder: string;
  defaultValue: string;
  rows: number;
}
export const initialArgs: TextAreaStoryProps = /* story-args:start */ {
  placeholder: "Share a quick project update...",
  defaultValue: "",
  rows: 4,
  disabled: false,
  required: false,
  readOnly: false,
  variant: "primary",
  fullWidth: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 384, maxWidth: "100%" } });
export function Basic(overrides: TextAreaStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <TextArea aria-label="Quick project update" xstyle={styles.field} {...args} />;
}
