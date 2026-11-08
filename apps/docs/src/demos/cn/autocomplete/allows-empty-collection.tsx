"use client";

import { NativeAutocomplete } from "../../en/autocomplete/_native";
export function AllowsEmptyCollection() {
  return (
    <NativeAutocomplete
      items={[]}
      label="州"
      searchLabel="Search states"
      searchPlaceholder="Search states..."
    />
  );
}
