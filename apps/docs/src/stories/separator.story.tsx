import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/separator";
export const story = defineStory({
  displayName: "Separator",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
