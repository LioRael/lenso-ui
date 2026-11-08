"use client";
import { NativeAutocomplete } from "./_native";
import { states } from "./default";
export function WithDescription() {
  return (
    <NativeAutocomplete
      items={states}
      label="State"
      searchLabel="Search states"
      searchPlaceholder="Search states..."
      description="Select your state of residence"
    />
  );
}
