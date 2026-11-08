import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/fieldset";
export const story = defineStory({
  displayName: "Fieldset",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
