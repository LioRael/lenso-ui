import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/card";
export const story = defineStory({
  displayName: "Card",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
