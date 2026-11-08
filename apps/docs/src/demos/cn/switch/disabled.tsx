"use client";

import { Switch } from "@lenso/ui";
export function Disabled() {
  return (
    <Switch disabled>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        启用通知
      </Switch.Content>
    </Switch>
  );
}
