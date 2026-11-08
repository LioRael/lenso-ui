"use client";

import { Switch } from "@lenso/ui";
export function WithoutLabel() {
  return (
    <Switch aria-label="启用通知">
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}
