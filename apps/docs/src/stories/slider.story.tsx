import { defineStory } from "./story";
import { SliderStory } from "./materials";
export const story = defineStory({
  displayName: "Slider",
  Component: SliderStory,
  args: [
    { variant: "Default", initial: { value: 50, min: 0, max: 100, step: 1, disabled: false } },
  ],
});
