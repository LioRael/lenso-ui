import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/combo-box";
export const story = defineStory({
  displayName: "ComboBox",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
