import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/textfield";
export const story = defineStory({
  displayName: "TextField",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
