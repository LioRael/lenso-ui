"use client";
import { Switch } from "@lenso/ui";
export function DefaultSelected() {
  return (
    <Switch defaultChecked>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        Enable notifications
      </Switch.Content>
    </Switch>
  );
}
