import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/toggle-button";
export const story = defineStory({
  displayName: "ToggleButton",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
