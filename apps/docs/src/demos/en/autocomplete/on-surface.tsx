"use client";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
export function OnSurface() {
  return (
    <div>
      <TextSuggestions label="State to visit" options={states.map((item) => item.name)} />
    </div>
  );
}
