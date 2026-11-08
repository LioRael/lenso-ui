import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/alert";
export const story = defineStory({
  displayName: "Alert",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
