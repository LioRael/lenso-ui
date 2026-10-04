// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const interests = [
  {
    value: "coding",
    label: "编程",
    description: "热爱构建软件",
  },
  {
    value: "design",
    label: "设计",
    description: "喜欢打造精美界面",
  },
  {
    value: "writing",
    label: "写作",
    description: "热衷于内容创作",
  },
];
export function Basic() {
  const id = useId();
  return (
    <TextField name="interests">
      <CheckboxGroup aria-labelledby={`${id}-label`} aria-describedby={`${id}-help`}>
        <span id={`${id}-label`} {...stylex.props(labelStyles.label)}>
          选择你的兴趣
        </span>
        <span id={`${id}-help`} {...stylex.props(descriptionStyles.description)}>
          可多选
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
