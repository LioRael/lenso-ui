"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ButtonGroupStoryProps extends Pick<
  StoryComponentProps<typeof ButtonGroup>,
  "disabled" | "size" | "variant" | "fullWidth" | "orientation"
> {}
export const initialArgs: ButtonGroupStoryProps = /* story-args:start */ {
  disabled: false,
  size: "md",
  variant: "primary",
  fullWidth: false,
  orientation: "horizontal",
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button, ButtonGroup } from "@lenso/ui";
import { useState } from "react";
export function Basic(overrides: ButtonGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const [action, setAction] = useState("");
  return (
    <div>
      <ButtonGroup aria-label="File actions" {...args}>
        {["New", "Edit", "Delete"].map((label) => (
          <Button key={label} onClick={() => setAction(label)}>
            {label}
          </Button>
        ))}
      </ButtonGroup>
      <output aria-live="polite">{action}</output>
    </div>
  );
}
