"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
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
            {checked ? "Enabled" : "Disabled"}
          </Switch.Content>
        </span>
      )}
    />
  );
}
