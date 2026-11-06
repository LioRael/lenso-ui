import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/autocomplete";
export const story = defineStory({
  displayName: "Autocomplete",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
