"use client";
import { useState } from "react";
import { Stepper } from "@lenso/ui";
export interface StepperStoryProps {
  disabled: boolean;
}
export function StepperStory({ disabled }: StepperStoryProps) {
  const [value, setValue] = useState<number | null>(1);
  return (
    <div>
      <p aria-live="polite">Quantity: {value}</p>
      <Stepper value={value} onValueChange={setValue} min={0} max={10} disabled={disabled}>
        <Stepper.Input aria-label="Quantity" />
        <Stepper.Group>
          <Stepper.DecrementButton />
          <Stepper.IncrementButton />
        </Stepper.Group>
      </Stepper>
    </div>
  );
}
