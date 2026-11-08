"use client";
import { NativeAutocomplete } from "./_native";
import { controlledStates } from "./controlled";
export function MultipleSelect() {
  return (
    <NativeAutocomplete
      items={controlledStates}
      label="States"
      placeholder="Select states"
      multiple
      chips
    />
  );
}
