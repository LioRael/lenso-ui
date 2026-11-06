import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/color-slider";
export const story = defineStory({
  displayName: "ColorSlider",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
