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
          Features
        </span>
        <span id={`${labelId}-help`} {...stylex.props(descriptionStyles.description)}>
          Select the features you want
        </span>
        <Checkbox
          value="notifications"
          aria-label="Email notifications"
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
            Email notifications
          </Checkbox.Content>
          <span
            id={`${labelId}-notifications`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            Receive updates via email
          </span>
        </Checkbox>
        <Checkbox
          value="newsletter"
          aria-label="Newsletter"
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
            Newsletter
          </Checkbox.Content>
          <span
            id={`${labelId}-newsletter`}
            {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
          >
            Get weekly newsletters
          </span>
        </Checkbox>
      </CheckboxGroup>
    </TextField>
  );
}
