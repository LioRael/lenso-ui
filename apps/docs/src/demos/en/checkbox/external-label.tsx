"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { display: "flex", alignItems: "center", gap: ".75rem" } });
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
        Send me marketing emails
      </label>
    </div>
  );
}
