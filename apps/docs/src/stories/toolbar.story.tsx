import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/toolbar";
export const story = defineStory({
  displayName: "Toolbar",
  Component: Preview,
  args: [
    { variant: "Default", initial: initialArgs },
    { variant: "Navigation composition", initial: { ...initialArgs, navigation: true } },
  ],
});
