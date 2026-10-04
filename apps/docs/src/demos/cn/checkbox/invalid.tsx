// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, FieldError, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
export function Invalid() {
  return (
    <TextField invalid>
      <Checkbox required name="agreement">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          我同意条款
        </Checkbox.Content>
        <FieldError
          match
          xstyle={[checkboxSupportingStyles.direct, checkboxSupportingStyles.error]}
        >
          您必须接受条款才能继续
        </FieldError>
      </Checkbox>
    </TextField>
  );
}
