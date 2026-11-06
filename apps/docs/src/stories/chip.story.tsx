import { defineStory } from "./story";
import { ChipBasic as Preview, initialArgs } from "@/demos/stories/chip";
export const story = defineStory({
  displayName: "Chip",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
