import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/radio";
export const story = defineStory({
  displayName: "Radio",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
