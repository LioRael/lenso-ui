import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/button-group";
export const story = defineStory({
  displayName: "ButtonGroup",
  Component: Preview,
  args: [
    { variant: "Default", initial: initialArgs },
    { variant: "Glass", initial: { ...initialArgs, glass: true, variant: "default" } },
  ],
});
