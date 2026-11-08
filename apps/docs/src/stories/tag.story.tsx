import { defineStory } from "./story";
import { TagGroupBasic as Preview, initialArgs } from "@/demos/stories/tag";
export const story = defineStory({
  displayName: "Tag",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
