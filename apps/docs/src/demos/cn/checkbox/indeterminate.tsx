"use client";

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
