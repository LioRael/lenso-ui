import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/table";
export const story = defineStory({
  displayName: "Table",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
