import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/list-box";
export const story = defineStory({
  displayName: "ListBox",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
