import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/number-field";
export const story = defineStory({
  displayName: "NumberField",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
