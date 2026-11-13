"use client";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
import { states } from "../../en/autocomplete/default";
export function WithDescription() {
  return (
    <div>
      <TextSuggestions
        label="计划前往的州"
        options={states.map((item) => item.name)}
        description="Suggestions are optional; any text remains a valid value."
      />
    </div>
  );
}
