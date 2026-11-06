import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/meter";
export const story = defineStory({
  displayName: "Meter",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
