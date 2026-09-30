"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Switch, SwitchGroup } from "@lenso/ui";
export function Group() {
  return (
    <SwitchGroup>
      <Switch name="notifications">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Allow Notifications
        </Switch.Content>
      </Switch>
      <Switch name="marketing">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Marketing emails
        </Switch.Content>
      </Switch>
      <Switch name="social">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Social media updates
        </Switch.Content>
      </Switch>
    </SwitchGroup>
  );
}
