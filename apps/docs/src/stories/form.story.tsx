import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/form";
export const story = defineStory({
  displayName: "Form",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
