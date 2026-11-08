"use client";
import type { ComponentProps } from "react";
import { Radio, RadioGroup } from "@lenso/ui";
export interface RadioGroupStoryProps extends Pick<
  ComponentProps<typeof RadioGroup>,
  "disabled" | "readOnly" | "required" | "variant"
> {}
export const initialArgs: RadioGroupStoryProps = /* story-args:start */ {
  disabled: false,
  readOnly: false,
  required: false,
  variant: "primary",
}; /* story-args:end */

export function Preview(overrides: RadioGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <RadioGroup aria-label="Plan" defaultValue="basic" {...args}>
      {["basic", "premium"].map((value) => (
        <Radio key={value} value={value}>
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
