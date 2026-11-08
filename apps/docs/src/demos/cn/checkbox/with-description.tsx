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
          邮件通知
        </Checkbox.Content>
        <Description id="description-notifications-help" xstyle={checkboxSupportingStyles.direct}>
          当有人在评论中提及您时收到通知
        </Description>
      </Checkbox>
    </TextField>
  );
}
