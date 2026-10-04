// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    gap: ".75rem",
  },
});
export function ExternalLabel() {
  return (
    <div {...stylex.props(styles.root)}>
      <Checkbox id="label-marketing">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox.Content>
      </Checkbox>
      <label {...stylex.props(labelStyles.label)} htmlFor="label-marketing">
        给我发送营销邮件
      </label>
    </div>
  );
}
