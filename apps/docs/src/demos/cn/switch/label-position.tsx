"use client";

import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
});
export function LabelPosition() {
  return (
    <div {...stylex.props(styles.root)}>
      <Switch>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          标签在后
        </Switch.Content>
      </Switch>
      <Switch>
        <Switch.Content>
          标签在前
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
  );
}
