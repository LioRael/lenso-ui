import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/radio-group";
export const story = defineStory({
  displayName: "RadioGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
