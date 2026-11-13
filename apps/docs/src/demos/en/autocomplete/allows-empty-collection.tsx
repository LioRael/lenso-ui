"use client";
import { TextSuggestions } from "./text-suggestions";
export function AllowsEmptyCollection() {
  return (
    <div>
      <TextSuggestions label="State to visit" options={[]} />
    </div>
  );
}
