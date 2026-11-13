"use client";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
export function WithDescription() {
  return (
    <div>
      <TextSuggestions
        label="State to visit"
        options={states.map((item) => item.name)}
        description="Suggestions are optional; any text remains a valid value."
      />
    </div>
  );
}
