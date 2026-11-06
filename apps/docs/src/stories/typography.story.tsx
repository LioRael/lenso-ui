import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/typography";
export const story = defineStory({
  displayName: "Typography",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
