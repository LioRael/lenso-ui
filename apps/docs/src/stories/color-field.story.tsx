import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/color-field";
export const story = defineStory({
  displayName: "ColorField",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
