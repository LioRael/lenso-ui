"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorFieldStoryProps extends Pick<
  StoryComponentProps<typeof ColorField>,
  "isDisabled" | "isInvalid" | "fullWidth"
> {
  initialColor: string;
}
export const initialArgs: ColorFieldStoryProps = /* story-args:start */ {
  initialColor: "#0485f7",
  isDisabled: false,
  isInvalid: false,
  fullWidth: false,
}; /* story-args:end */

import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 280, maxWidth: "100%" } });
export function Basic(overrides: ColorFieldStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { initialColor, ...props } = args;
  const [color, setColor] = useState<ReturnType<typeof parseColor> | null>(() =>
    parseColor(initialColor),
  );
  return (
    <ColorField xstyle={styles.field} name="color" value={color} onChange={setColor} {...props}>
      <ColorField.Label>Color</ColorField.Label>
      <ColorField.Group>
        <ColorField.Prefix>
          <ColorSwatch {...(color ? { color } : {})} size="xs" />
        </ColorField.Prefix>
        <ColorField.Input />
      </ColorField.Group>
    </ColorField>
  );
}
