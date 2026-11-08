"use client";

import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
export function Disabled() {
  return (
    <TextField>
      <Checkbox disabled id="feature" aria-describedby="feature-help">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          高级功能
        </Checkbox.Content>
        <Description id="feature-help" xstyle={checkboxSupportingStyles.direct}>
          该功能即将推出
        </Description>
      </Checkbox>
    </TextField>
  );
}
