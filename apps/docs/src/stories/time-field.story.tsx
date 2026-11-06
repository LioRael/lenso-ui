import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/time-field";
export const story = defineStory({
  displayName: "TimeField",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
