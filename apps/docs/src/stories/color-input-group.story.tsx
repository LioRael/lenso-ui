import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/color-input-group";
export const story = defineStory({
  displayName: "ColorInputGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
