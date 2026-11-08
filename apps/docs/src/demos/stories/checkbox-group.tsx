"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface CheckboxGroupStoryProps extends Pick<
  StoryComponentProps<typeof CheckboxGroup>,
  "disabled" | "variant"
> {}
export const initialArgs: CheckboxGroupStoryProps = /* story-args:start */ {
  disabled: false,
  variant: "primary",
}; /* story-args:end */

import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";

const interests = [
  { value: "coding", label: "Coding", description: "Love building software" },
  { value: "design", label: "Design", description: "Enjoy creating beautiful interfaces" },
  { value: "writing", label: "Writing", description: "Passionate about content creation" },
];
export function Basic(overrides: CheckboxGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const id = useId();
  return (
    <TextField name="interests">
      <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`} {...args}>
        <span id={`${id}-label`} {...stylex.props(labelStyles.label)}>
          Select your interests
        </span>
        <span id={`${id}-help`} {...stylex.props(descriptionStyles.description)}>
          Choose all that apply
        </span>
        {interests.map((interest) => (
          <Checkbox
            key={interest.value}
            value={interest.value}
            aria-label={interest.label}
            aria-describedby={`${id}-${interest.value}`}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {interest.label}
            </Checkbox.Content>
            <span
              id={`${id}-${interest.value}`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              {interest.description}
            </span>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </TextField>
  );
}
