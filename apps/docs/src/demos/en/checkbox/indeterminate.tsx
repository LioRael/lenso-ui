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
          Select all
        </Checkbox.Content>
        <Description xstyle={checkboxSupportingStyles.direct}>
          Shows indeterminate state (dash icon)
        </Description>
      </Checkbox>
    </TextField>
  );
}
