"use client";
import { useState } from "react";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
export const controlledStates = [
  { id: "california", name: "California" },
  { id: "texas", name: "Texas" },
];
export function Controlled() {
  const [value, setValue] = useState("California");
  return (
    <div>
      <TextSuggestions
        label="计划前往的州"
        options={controlledStates.map((item) => item.name)}
        value={value}
        onValueChange={setValue}
      />
      <output>{value}</output>
    </div>
  );
}
