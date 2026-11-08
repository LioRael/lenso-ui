"use client";
import * as stylex from "@stylexjs/stylex";
import { Switch } from "@lenso/ui";
export function Group() {
  return (
    <fieldset {...stylex.props(switchGrouping.root)} aria-label="Notification preferences">
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
    </fieldset>
  );
}

const switchGrouping = stylex.create({
  root: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
    minWidth: 0,
    display: "flex",
    gap: 12,
    flexDirection: "column",
  },
});
