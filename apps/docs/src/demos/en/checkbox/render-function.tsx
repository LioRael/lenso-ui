"use client";
import { Checkbox } from "@lenso/ui";
export function RenderFunction() {
  return (
    <Checkbox render={(props) => <div {...props} data-custom="bar" />}>
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        Accept terms and conditions
      </Checkbox.Content>
    </Checkbox>
  );
}
