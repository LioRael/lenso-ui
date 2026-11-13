"use client";
import { useState } from "react";
import { Button } from "@lenso/ui";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <TextSuggestions
        label="State to visit"
        options={states.map((item) => item.name)}
        open={open}
        onOpenChange={setOpen}
      />
      <Button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"} suggestions</Button>
    </div>
  );
}
