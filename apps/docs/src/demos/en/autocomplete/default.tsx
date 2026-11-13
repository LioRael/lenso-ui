"use client";
import { TextSuggestions } from "./text-suggestions";

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
    <TextSuggestions
      label="State to visit"
      options={states.map((item) => item.name)}
      placeholder="Enter any state"
    />
  );
}
