"use client";

import { Checkbox, Description, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
export function RenderProps() {
  return (
    <TextField>
      <Checkbox
        id="render-props-terms"
        render={(props, { checked }) => (
          <span {...props}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {checked ? "已同意条款" : "接受条款"}
            </Checkbox.Content>
            <Description xstyle={checkboxSupportingStyles.direct}>
              {checked ? "感谢您的确认" : "请先阅读并接受条款"}
            </Description>
          </span>
        )}
      />
    </TextField>
  );
}
