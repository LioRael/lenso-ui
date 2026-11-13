"use client";
import { useState } from "react";
import { Button } from "@lenso/ui";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
import { states } from "../../en/autocomplete/default";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <TextSuggestions
        label="计划前往的州"
        options={states.map((item) => item.name)}
        open={open}
        onOpenChange={setOpen}
      />
      <Button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"} suggestions</Button>
    </div>
  );
}
