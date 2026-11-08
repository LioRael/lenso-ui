import { defineStory } from "./story";
import { Default as Preview, initialArgs } from "@/demos/stories/input-group";
export const story = defineStory({
  displayName: "InputGroup",
  Component: Preview,
  args: [
    { variant: "Content", initial: initialArgs },
    { variant: "Floating glass", initial: { ...initialArgs, glass: true } },
  ],
});
