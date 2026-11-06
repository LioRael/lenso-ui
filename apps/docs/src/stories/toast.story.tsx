import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/toast";
export const story = defineStory({
  displayName: "Toast",
  Component: Preview,
  args: [
    { variant: "Default", initial: initialArgs },
    { variant: "Accent", initial: { ...initialArgs, variant: "accent", description: "" } },
  ],
});
