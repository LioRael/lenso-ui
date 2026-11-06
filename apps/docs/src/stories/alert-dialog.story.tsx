import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/alert-dialog";
export const story = defineStory({
  displayName: "AlertDialog",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
