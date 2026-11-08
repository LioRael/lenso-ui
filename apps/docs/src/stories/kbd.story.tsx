import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/kbd";
export const story = defineStory({
  displayName: "Kbd",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
