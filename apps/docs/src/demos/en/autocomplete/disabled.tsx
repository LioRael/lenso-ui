"use client";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
export function Disabled() {
  return (
    <div>
      <TextSuggestions label="State to visit" options={states.map((item) => item.name)} disabled />
    </div>
  );
}
