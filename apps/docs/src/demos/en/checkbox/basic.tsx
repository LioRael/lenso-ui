"use client";
import { Checkbox } from "@lenso/ui";

export function Basic() {
  return (
    <Checkbox name="basic-terms">
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        Accept terms and conditions
      </Checkbox.Content>
    </Checkbox>
  );
}
