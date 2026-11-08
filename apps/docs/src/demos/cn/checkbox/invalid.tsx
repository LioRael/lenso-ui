"use client";

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
