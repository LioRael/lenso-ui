import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/select";
export const story = defineStory({
  displayName: "Select",
  Component: Preview,
  args: [
    { variant: "Default", initial: initialArgs },
    { variant: "Below trigger", initial: { ...initialArgs, alignItemWithTrigger: false } },
  ],
});
