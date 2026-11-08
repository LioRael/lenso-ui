import { defineStory } from "./story";
import { CommandStory } from "@/demos/stories/command";
export const story = defineStory({
  displayName: "Command",
  Component: CommandStory,
  args: [{ variant: "Workspace commands", initial: { disabled: false } }],
});
