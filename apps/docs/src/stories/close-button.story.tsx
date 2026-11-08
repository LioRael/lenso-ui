import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/close-button";
export const story = defineStory({
  displayName: "CloseButton",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
