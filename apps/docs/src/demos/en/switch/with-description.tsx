"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Description, Switch, TextField } from "@lenso/ui";
import { switchSupportingStyles } from "@lenso/tokens/switch";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { maxWidth: "24rem" } });
export function WithDescription() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextField>
        <Switch aria-describedby="public-profile-help">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Public profile
          </Switch.Content>
          <Description id="public-profile-help" xstyle={switchSupportingStyles.direct}>
            Allow others to see your profile information
          </Description>
        </Switch>
      </TextField>
    </div>
  );
}
