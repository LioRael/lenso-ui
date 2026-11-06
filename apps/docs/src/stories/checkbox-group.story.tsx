import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/checkbox-group";
export const story = defineStory({
  displayName: "CheckboxGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
