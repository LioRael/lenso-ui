import { defineStory } from "./story";
import { ColorAreaBasic as Preview, initialArgs } from "@/demos/stories/color-area";
export const story = defineStory({
  displayName: "ColorArea",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
