"use client";

import { NativeAutocomplete } from "../../en/autocomplete/_native";
export const states = [
  {
    id: "florida",
    name: "Florida",
  },
  {
    id: "delaware",
    name: "Delaware",
  },
  {
    id: "california",
    name: "California",
  },
  {
    id: "texas",
    name: "Texas",
  },
  {
    id: "new-york",
    name: "New York",
  },
  {
    id: "washington",
    name: "Washington",
  },
];
export default function Default() {
  return (
    <NativeAutocomplete
      items={states}
      label="计划前往的州"
      placeholder="选择州/省"
      multiple
      chips
      hideClear
    />
  );
}
