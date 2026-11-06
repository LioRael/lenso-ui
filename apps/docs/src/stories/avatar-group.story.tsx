import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/avatar-group";
export const story = defineStory({
  displayName: "AvatarGroup",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
