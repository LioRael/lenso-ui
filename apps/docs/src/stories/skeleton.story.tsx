import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/skeleton";
export const story = defineStory({
  displayName: "Skeleton",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
