import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/progress-bar";
export const story = defineStory({
  displayName: "ProgressBar",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
