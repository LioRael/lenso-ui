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
          Premium Feature
        </Checkbox.Content>
        <Description id="feature-help" xstyle={checkboxSupportingStyles.direct}>
          This feature is coming soon
        </Description>
      </Checkbox>
    </TextField>
  );
}
