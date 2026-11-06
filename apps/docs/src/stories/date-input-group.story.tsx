import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/date-input-group";
export const story = defineStory({
  displayName: "DateInputGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
