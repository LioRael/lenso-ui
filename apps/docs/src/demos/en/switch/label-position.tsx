"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { display: "flex", flexDirection: "column", gap: "1rem" } });
export function LabelPosition() {
  return (
    <div {...stylex.props(styles.root)}>
      <Switch>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Label after
        </Switch.Content>
      </Switch>
      <Switch>
        <Switch.Content>
          Label before
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
  );
}
