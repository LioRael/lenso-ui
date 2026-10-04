// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { useState } from "react";
export function Indeterminate() {
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  return (
    <TextField>
      <Checkbox
        id="select-all"
        indeterminate={isIndeterminate}
        checked={isSelected}
        onCheckedChange={(selected) => {
          setIsSelected(selected);
          setIsIndeterminate(false);
        }}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          全选
        </Checkbox.Content>
        <Description xstyle={checkboxSupportingStyles.direct}>
          展示部分选中状态（短横线图标）
        </Description>
      </Checkbox>
    </TextField>
  );
}
