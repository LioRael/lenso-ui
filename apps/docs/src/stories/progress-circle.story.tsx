import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/progress-circle";
export const story = defineStory({
  displayName: "ProgressCircle",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
