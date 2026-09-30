"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
export function Disabled() {
  const labelId = useId();
  return (
    <TextField name="disabled-features">
      <CheckboxGroup disabled aria-labelledby={labelId} aria-describedby={`${labelId}-help`}>
        <span id={labelId} {...stylex.props(labelStyles.label)}>
          Features
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          Feature selection is temporarily disabled
        </span>
        <Checkbox value="feature1" aria-label="Feature 1" aria-describedby={`${labelId}-feature1`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Feature 1
          </Checkbox.Content>
          <span
            id={`${labelId}-feature1`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            This feature is coming soon
          </span>
        </Checkbox>
        <Checkbox value="feature2" aria-label="Feature 2" aria-describedby={`${labelId}-feature2`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Feature 2
          </Checkbox.Content>
          <span
            id={`${labelId}-feature2`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            This feature is coming soon
          </span>
        </Checkbox>
      </CheckboxGroup>
    </TextField>
  );
}
