"use client";

import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    gap: "1.5rem",
  },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.root)}>
      <Switch size="sm">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          小
        </Switch.Content>
      </Switch>
      <Switch size="md">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          中
        </Switch.Content>
      </Switch>
      <Switch size="lg">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          大
        </Switch.Content>
      </Switch>
    </div>
  );
}
