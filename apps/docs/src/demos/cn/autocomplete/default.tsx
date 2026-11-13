"use client";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
import { states } from "../../en/autocomplete/default";
export default function Default() {
  return (
    <TextSuggestions
      label="计划前往的州"
      options={states.map((item) => item.name)}
      placeholder="输入任意州名"
    />
  );
}
