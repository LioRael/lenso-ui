import { defineStory } from "./story";
import { TagGroupBasic as Preview, initialArgs } from "@/demos/stories/tag-group";
export const story = defineStory({
  displayName: "TagGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
