"use client";

import { Switch } from "@lenso/ui";
export function RenderFunction() {
  return (
    <Switch render={(props) => <div {...props} data-custom="foo" />}>
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        启用通知
      </Switch.Content>
    </Switch>
  );
}
