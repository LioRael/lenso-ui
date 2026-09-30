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
          I agree to the terms
        </Checkbox.Content>
        <FieldError
          match
          xstyle={[checkboxSupportingStyles.direct, checkboxSupportingStyles.error]}
        >
          You must accept the terms to continue
        </FieldError>
      </Checkbox>
    </TextField>
  );
}
