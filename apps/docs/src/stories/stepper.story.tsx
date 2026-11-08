import { defineStory } from "./story";
import { StepperStory } from "./stepper";
export const story = defineStory({
  displayName: "Stepper",
  Component: StepperStory,
  args: [{ variant: "Default", initial: { disabled: false } }],
});
