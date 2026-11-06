import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/toggle-button-group";
export const story = defineStory({
  displayName: "ToggleButtonGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
