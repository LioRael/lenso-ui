// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
  },
  heading: {
    fontSize: ".875rem",
    fontWeight: 500,
    color: "var(--muted)",
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.heading)}>主要变体</p>
        <TextField>
          <Checkbox id="primary" name="primary" variant="primary">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              主要复选框
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>默认背景的标准样式</Description>
          </Checkbox>
        </TextField>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.heading)}>次要变体</p>
        <TextField>
          <Checkbox id="secondary" name="secondary" variant="secondary">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              次要复选框
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              用于表面容器的低强调样式
            </Description>
          </Checkbox>
        </TextField>
      </div>
    </div>
  );
}
