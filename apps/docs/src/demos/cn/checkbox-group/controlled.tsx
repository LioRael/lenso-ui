// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup, TextField } from "@lenso/ui";
import { labelStyles } from "@lenso/tokens/label";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    minWidth: "320px",
  },
  summary: {
    marginBlock: "1rem",
    fontSize: ".875rem",
    color: "var(--muted)",
  },
});
export function Controlled() {
  const labelId = useId();
  const [selected, setSelected] = useState(["coding", "design"]);
  return (
    <TextField name="skills">
      <CheckboxGroup
        aria-labelledby={labelId}
        xstyle={styles.root}
        value={selected}
        onValueChange={setSelected}
      >
        <span id={labelId} {...stylex.props(labelStyles.label)}>
          你的技能
        </span>
        <Checkbox value="coding">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            编程
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="design">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            设计
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="writing">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            写作
          </Checkbox.Content>
        </Checkbox>
        <p {...stylex.props(styles.summary)}>已选：{selected.join(", ") || "无"}</p>
      </CheckboxGroup>
    </TextField>
  );
}
