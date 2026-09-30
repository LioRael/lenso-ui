"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { display: "flex", gap: "1.5rem" } });
export function Sizes() {
  return (
    <div {...stylex.props(styles.root)}>
      <Switch size="sm">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Small
        </Switch.Content>
      </Switch>
      <Switch size="md">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Medium
        </Switch.Content>
      </Switch>
      <Switch size="lg">
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Large
        </Switch.Content>
      </Switch>
    </div>
  );
}
