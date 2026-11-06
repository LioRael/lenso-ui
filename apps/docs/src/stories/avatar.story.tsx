import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/avatar";
export const story = defineStory({
  displayName: "Avatar",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
