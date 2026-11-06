import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/surface";
export const story = defineStory({
  displayName: "Surface",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
