"use client";
import { Checkbox } from "@lenso/ui";
export function DefaultSelected() {
  return (
    <Checkbox defaultChecked id="default-notifications">
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        Enable email notifications
      </Checkbox.Content>
    </Checkbox>
  );
}
