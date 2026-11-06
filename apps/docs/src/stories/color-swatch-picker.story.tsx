import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/color-swatch-picker";
export const story = defineStory({
  displayName: "ColorSwatchPicker",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
