import { defineStory } from "./story";
import { BadgeBasic as Preview, initialArgs } from "@/demos/stories/badge";
export const story = defineStory({
  displayName: "Badge",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
