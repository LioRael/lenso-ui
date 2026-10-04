// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, CheckboxGroup } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  children: {
    marginInlineStart: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
  },
});
export function Indeterminate() {
  const [selected, setSelected] = useState(["coding"]);
  const allOptions = ["coding", "design", "writing"];
  return (
    <div>
      <Checkbox
        indeterminate={selected.length > 0 && selected.length < allOptions.length}
        checked={selected.length === allOptions.length}
        name="select-all"
        onCheckedChange={(checked) => setSelected(checked ? allOptions : [])}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          全选
        </Checkbox.Content>
      </Checkbox>
      <div {...stylex.props(styles.children)}>
        <CheckboxGroup value={selected} onValueChange={setSelected}>
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
        </CheckboxGroup>
      </div>
    </div>
  );
}
