"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
export function RenderProps() {
  return (
    <TextField>
      <Checkbox
        id="render-props-terms"
        render={(props, { checked }) => (
          <span {...props}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {checked ? "Terms accepted" : "Accept terms"}
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              {checked ? "Thank you for accepting" : "Please read and accept the terms"}
            </Description>
          </span>
        )}
      />
    </TextField>
  );
}
