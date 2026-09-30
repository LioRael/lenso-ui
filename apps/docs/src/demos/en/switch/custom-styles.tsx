"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Description, Label, Switch, TextField } from "@lenso/ui";
import { switchSupportingStyles } from "@lenso/tokens/switch";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  control: {
    "--switch-control-bg-checked": "var(--success)",
    "--switch-control-bg-checked-hover": "var(--success)",
  },
  copy: { display: "flex", flexDirection: "column", gap: ".125rem" },
});
export function CustomStyles() {
  return (
    <TextField>
      <Switch id="autosave" aria-describedby="autosave-help">
        <Switch.Content>
          <Switch.Control xstyle={styles.control}>
            <Switch.Thumb />
          </Switch.Control>
          <div {...stylex.props(styles.copy)}>
            <Label>Auto-save drafts</Label>
            <Description id="autosave-help" xstyle={switchSupportingStyles.direct}>
              Changes are saved as you type.
            </Description>
          </div>
        </Switch.Content>
      </Switch>
    </TextField>
  );
}
