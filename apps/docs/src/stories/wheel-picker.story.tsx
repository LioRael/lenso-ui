import { defineStory } from "./story";
import { WheelPickerStory } from "./wheel-picker";
export const story = defineStory({
  displayName: "WheelPicker",
  Component: WheelPickerStory,
  args: [{ variant: "Duration", initial: { disabled: false } }],
});
