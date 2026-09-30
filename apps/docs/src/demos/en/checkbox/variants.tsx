"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "1rem" },
  section: { display: "flex", flexDirection: "column", gap: ".5rem" },
  heading: { fontSize: ".875rem", fontWeight: 500, color: "var(--muted)" },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.heading)}>Primary variant</p>
        <TextField>
          <Checkbox id="primary" name="primary" variant="primary">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              Primary checkbox
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              Standard styling with default background
            </Description>
          </Checkbox>
        </TextField>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.heading)}>Secondary variant</p>
        <TextField>
          <Checkbox id="secondary" name="secondary" variant="secondary">
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              Secondary checkbox
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              Lower emphasis variant for use in surfaces
            </Description>
          </Checkbox>
        </TextField>
      </div>
    </div>
  );
}
