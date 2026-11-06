"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface CheckboxStoryProps extends Pick<
  StoryComponentProps<typeof Checkbox>,
  "disabled" | "defaultChecked" | "required" | "readOnly" | "variant"
> {}
export const initialArgs: CheckboxStoryProps = /* story-args:start */ {
  disabled: false,
  defaultChecked: false,
  required: false,
  readOnly: false,
  variant: "secondary",
}; /* story-args:end */

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";

export function Basic(overrides: CheckboxStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Checkbox name="basic-terms" {...args}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        Accept terms and conditions
      </Checkbox.Content>
    </Checkbox>
  );
}
