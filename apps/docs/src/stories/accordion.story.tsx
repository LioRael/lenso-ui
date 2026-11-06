import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/accordion";
export const story = defineStory({
  displayName: "Accordion",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
