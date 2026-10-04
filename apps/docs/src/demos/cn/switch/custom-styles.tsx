// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
  copy: {
    display: "flex",
    flexDirection: "column",
    gap: ".125rem",
  },
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
            <Label>自动保存草稿</Label>
            <Description id="autosave-help" xstyle={switchSupportingStyles.direct}>
              输入时会自动保存更改。
            </Description>
          </div>
        </Switch.Content>
      </Switch>
    </TextField>
  );
}
