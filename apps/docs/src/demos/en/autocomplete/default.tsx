"use client";
import { NativeAutocomplete } from "./_native";

export const states = [
  { id: "florida", name: "Florida" },
  { id: "delaware", name: "Delaware" },
  { id: "california", name: "California" },
  { id: "texas", name: "Texas" },
  { id: "new-york", name: "New York" },
  { id: "washington", name: "Washington" },
];
export default function Default() {
  return (
    <NativeAutocomplete
      items={states}
      label="States to Visit"
      placeholder="Select states"
      multiple
      chips
      hideClear
    />
  );
}
