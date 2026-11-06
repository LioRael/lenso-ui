import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/description";
export const story = defineStory({
  displayName: "Description",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
