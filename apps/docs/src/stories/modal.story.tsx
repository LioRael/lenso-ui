import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/modal";
export const story = defineStory({
  displayName: "Modal",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
