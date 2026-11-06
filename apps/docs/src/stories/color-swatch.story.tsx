import { defineStory } from "./story";
import { ColorSwatchBasic as Preview, initialArgs } from "@/demos/stories/color-swatch";
export const story = defineStory({
  displayName: "ColorSwatch",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
