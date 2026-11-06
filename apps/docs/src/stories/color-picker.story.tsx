import { defineStory } from "./story";
import { ColorPickerStory } from "./color-picker";
export const story = defineStory({
  displayName: "ColorPicker",
  Component: ColorPickerStory,
  args: [{ variant: "Default", initial: { initialColor: "#0485f7" } }],
});
