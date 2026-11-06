"use client";
import type { ComponentProps } from "react";
import { Radio, RadioGroup } from "@lenso/ui";
export interface RadioStoryProps extends Pick<
  ComponentProps<typeof Radio>,
  "disabled" | "readOnly" | "required"
> {}
export const initialArgs: RadioStoryProps = /* story-args:start */ {
  disabled: false,
  readOnly: false,
  required: false,
}; /* story-args:end */

export function Preview(overrides: RadioStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <RadioGroup aria-label="Plan" defaultValue="basic">
      {["basic", "premium"].map((value) => (
        <Radio key={value} value={value} {...args}>
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            {value}
          </Radio.Content>
        </Radio>
      ))}
    </RadioGroup>
  );
}
