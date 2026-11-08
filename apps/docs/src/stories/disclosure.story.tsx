import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/disclosure";
export const story = defineStory({
  displayName: "Disclosure",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
