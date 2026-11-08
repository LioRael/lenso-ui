"use client";
import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
export function GroupHorizontal() {
  return (
    <fieldset {...stylex.props(switchGrouping.root)} aria-label="Notification preferences">
      <Switch name="notifications">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Notifications
        </Switch.Content>
      </Switch>
      <Switch name="marketing">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Marketing
        </Switch.Content>
      </Switch>
      <Switch name="social">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Social
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
    flexDirection: "row",
    overflowX: "auto",
  },
});
