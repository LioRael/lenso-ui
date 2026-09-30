"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
export function RenderFunction() {
  const labelId = useId();
  return (
    <TextField name="interests">
      <CheckboxGroup
        aria-labelledby={labelId}
        aria-describedby={`${labelId}-help`}
        render={(props) => <div {...props} data-custom="foo" />}
      >
        <span id={labelId} {...stylex.props(labelStyles.label)}>
          Select your interests
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          Choose all that apply
        </span>
        <Checkbox value="coding" aria-label="Coding" aria-describedby={`${labelId}-coding`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Coding
          </Checkbox.Content>
          <span
            id={`${labelId}-coding`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            Love building software
          </span>
        </Checkbox>
        <Checkbox value="design" aria-label="Design" aria-describedby={`${labelId}-design`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Design
          </Checkbox.Content>
          <span
            id={`${labelId}-design`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            Enjoy creating beautiful interfaces
          </span>
        </Checkbox>
        <Checkbox value="writing" aria-label="Writing" aria-describedby={`${labelId}-writing`}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Writing
          </Checkbox.Content>
          <span
            id={`${labelId}-writing`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            Passionate about content creation
          </span>
        </Checkbox>
      </CheckboxGroup>
    </TextField>
  );
}
