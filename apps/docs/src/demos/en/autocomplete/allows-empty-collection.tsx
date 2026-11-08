"use client";
import { NativeAutocomplete } from "./_native";
export function AllowsEmptyCollection() {
  return (
    <NativeAutocomplete
      items={[]}
      label="State"
      searchLabel="Search states"
      searchPlaceholder="Search states..."
    />
  );
}
