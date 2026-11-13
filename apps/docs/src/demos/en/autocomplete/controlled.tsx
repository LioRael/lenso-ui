"use client";
import { useState } from "react";
import { TextSuggestions } from "./text-suggestions";
export const controlledStates = [
  { id: "california", name: "California" },
  { id: "texas", name: "Texas" },
];
export function Controlled() {
  const [value, setValue] = useState("California");
  return (
    <div>
      <TextSuggestions
        label="State to visit"
        options={controlledStates.map((item) => item.name)}
        value={value}
        onValueChange={setValue}
      />
      <output>{value}</output>
    </div>
  );
}
