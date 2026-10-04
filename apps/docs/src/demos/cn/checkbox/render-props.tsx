// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
              {checked ? "已同意条款" : "接受条款"}
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              {checked ? "感谢您的确认" : "请先阅读并接受条款"}
            </Description>
          </span>
        )}
      />
    </TextField>
  );
}
