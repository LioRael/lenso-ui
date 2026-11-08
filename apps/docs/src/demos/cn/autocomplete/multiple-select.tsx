"use client";

import { NativeAutocomplete } from "../../en/autocomplete/_native";
import { controlledStates } from "./controlled";
export function MultipleSelect() {
  return (
    <NativeAutocomplete
      items={controlledStates}
      label="州"
      placeholder="选择州/省"
      multiple
      chips
    />
  );
}
