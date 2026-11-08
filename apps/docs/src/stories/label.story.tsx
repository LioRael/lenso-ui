import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/label";
export const story = defineStory({
  displayName: "Label",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
