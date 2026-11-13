"use client";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
export function Variants() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <TextSuggestions label="Primary" options={states.map((item) => item.name)} />
      <TextSuggestions
        label="Secondary"
        variant="secondary"
        options={states.map((item) => item.name)}
      />
    </div>
  );
}
