"use client";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
export function AllowsEmptyCollection() {
  return (
    <div>
      <TextSuggestions label="计划前往的州" options={[]} />
    </div>
  );
}
