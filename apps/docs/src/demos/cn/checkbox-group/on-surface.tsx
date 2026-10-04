// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, Surface, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  surface: {
    width: "100%",
    borderRadius: "1.5rem",
    padding: "1.5rem",
  },
});
export function OnSurface() {
  const labelId = useId();
  return (
    <Surface xstyle={styles.surface}>
      <TextField name="interests">
        <CheckboxGroup
          variant="secondary"
          aria-labelledby={labelId}
          aria-describedby={`${labelId}-help`}
        >
          <span id={labelId} {...stylex.props(labelStyles.label)}>
            选择你的兴趣
          </span>
          <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
            可多选
          </span>
          <Checkbox value="coding" aria-label="编程" aria-describedby={`${labelId}-coding`}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              编程
            </Checkbox.Content>
            <span
              id={`${labelId}-coding`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              热爱构建软件
            </span>
          </Checkbox>
          <Checkbox value="design" aria-label="设计" aria-describedby={`${labelId}-design`}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              设计
            </Checkbox.Content>
            <span
              id={`${labelId}-design`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              喜欢打造精美界面
            </span>
          </Checkbox>
          <Checkbox value="writing" aria-label="写作" aria-describedby={`${labelId}-writing`}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              写作
            </Checkbox.Content>
            <span
              id={`${labelId}-writing`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              热衷于内容创作
            </span>
          </Checkbox>
        </CheckboxGroup>
      </TextField>
    </Surface>
  );
}
