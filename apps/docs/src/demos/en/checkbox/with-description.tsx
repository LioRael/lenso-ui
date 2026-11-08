"use client";
import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
export function WithDescription() {
  return (
    <TextField>
      <Checkbox name="description-notifications" aria-describedby="description-notifications-help">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          Email notifications
        </Checkbox.Content>
        <Description id="description-notifications-help" xstyle={checkboxSupportingStyles.direct}>
          Get notified when someone mentions you in a comment
        </Description>
      </Checkbox>
    </TextField>
  );
}
