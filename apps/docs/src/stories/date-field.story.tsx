import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/date-field";
export const story = defineStory({
  displayName: "DateField",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
