"use client";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
import { states } from "../../en/autocomplete/default";
export function FullWidth() {
  return (
    <div>
      <TextSuggestions label="计划前往的州" options={states.map((item) => item.name)} fullWidth />
    </div>
  );
}
