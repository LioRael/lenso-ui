"use client";

import { Switch } from "@lenso/ui";
export function RenderProps() {
  return (
    <Switch
      render={(props, { checked }) => (
        <span {...props}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            {checked ? "已开启" : "已关闭"}
          </Switch.Content>
        </span>
      )}
    />
  );
}
