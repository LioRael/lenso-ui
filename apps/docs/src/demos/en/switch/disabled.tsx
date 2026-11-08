"use client";
import { Switch } from "@lenso/ui";
export function Disabled() {
  return (
    <Switch disabled>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        Enable notifications
      </Switch.Content>
    </Switch>
  );
}
