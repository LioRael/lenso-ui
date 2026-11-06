import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/pagination";
export const story = defineStory({
  displayName: "Pagination",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
