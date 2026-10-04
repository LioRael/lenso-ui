// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Description, Switch, TextField } from "@lenso/ui";
import { switchSupportingStyles } from "@lenso/tokens/switch";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    maxWidth: "24rem",
  },
});
export function WithDescription() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextField>
        <Switch aria-describedby="public-profile-help">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            公开资料
          </Switch.Content>
          <Description id="public-profile-help" xstyle={switchSupportingStyles.direct}>
            允许他人查看你的资料信息
          </Description>
        </Switch>
      </TextField>
    </div>
  );
}
