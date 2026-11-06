import { defineStory } from "./story";
import { LinkBasic as Preview, initialArgs } from "@/demos/stories/link";
export const story = defineStory({
  displayName: "Link",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
