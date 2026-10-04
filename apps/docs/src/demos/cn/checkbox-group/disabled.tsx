// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
          功能
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          功能选择暂时不可用
        </span>
        <Checkbox value="feature1" aria-label="功能一" aria-describedby={`${labelId}-feature1`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            功能一
          </Checkbox.Content>
          <span
            id={`${labelId}-feature1`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            该功能即将推出
          </span>
        </Checkbox>
        <Checkbox value="feature2" aria-label="功能二" aria-describedby={`${labelId}-feature2`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            功能二
          </Checkbox.Content>
          <span
            id={`${labelId}-feature2`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            该功能即将推出
          </span>
        </Checkbox>
      </CheckboxGroup>
    </TextField>
  );
}
