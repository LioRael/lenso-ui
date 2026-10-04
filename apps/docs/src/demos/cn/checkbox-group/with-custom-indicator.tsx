// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
export function WithCustomIndicator() {
  const labelId = useId();
  return (
    <TextField name="features">
      <CheckboxGroup aria-labelledby={labelId} aria-describedby={`${labelId}-help`}>
        <span id={labelId} {...stylex.props(labelStyles.label)}>
          功能
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          选择你需要的功能
        </span>
        <Checkbox
          value="notifications"
          aria-label="邮件通知"
          aria-describedby={`${labelId}-notifications`}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator
                render={(props, { checked }) => (
                  <span {...props}>
                    {checked ? (
                      <svg
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </span>
                )}
              />
            </Checkbox.Control>
            邮件通知
          </Checkbox.Content>
          <span
            id={`${labelId}-notifications`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            通过邮件接收更新
          </span>
        </Checkbox>
        <Checkbox
          value="newsletter"
          aria-label="邮件通讯"
          aria-describedby={`${labelId}-newsletter`}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator
                render={(props, { checked }) => (
                  <span {...props}>
                    {checked ? (
                      <svg
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </span>
                )}
              />
            </Checkbox.Control>
            邮件通讯
          </Checkbox.Content>
          <span
            id={`${labelId}-newsletter`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            每周接收邮件简报
          </span>
        </Checkbox>
      </CheckboxGroup>
    </TextField>
  );
}
