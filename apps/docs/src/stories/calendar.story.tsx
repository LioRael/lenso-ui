import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/calendar";
export const story = defineStory({
  displayName: "Calendar",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
