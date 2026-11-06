import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/scroll-shadow";
export const story = defineStory({
  displayName: "ScrollShadow",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
