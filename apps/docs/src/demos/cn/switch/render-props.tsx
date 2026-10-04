// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
            {checked ? "已开启" : "已关闭"}
          </Switch.Content>
        </span>
      )}
    />
  );
}
