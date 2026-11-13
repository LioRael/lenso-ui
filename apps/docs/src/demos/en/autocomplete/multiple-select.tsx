"use client";
import { OptionPicker } from "./_native";
import { controlledStates } from "./controlled";
export function MultipleSelect() {
  return (
    <OptionPicker
      items={controlledStates}
      label="States"
      placeholder="Select states"
      multiple
      chips
    />
  );
}
