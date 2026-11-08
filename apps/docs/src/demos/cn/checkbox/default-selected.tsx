"use client";

import { Checkbox } from "@lenso/ui";
export function DefaultSelected() {
  return (
    <Checkbox defaultChecked id="default-notifications">
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        启用邮件通知
      </Checkbox.Content>
    </Checkbox>
  );
}
