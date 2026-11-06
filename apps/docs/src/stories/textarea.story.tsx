import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/textarea";
export const story = defineStory({
  displayName: "TextArea",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
