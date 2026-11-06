import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/drawer";
export const story = defineStory({
  displayName: "Drawer",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
