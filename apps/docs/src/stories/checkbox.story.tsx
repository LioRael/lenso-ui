import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/checkbox";
export const story = defineStory({
  displayName: "Checkbox",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
