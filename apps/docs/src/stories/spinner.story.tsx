import { defineStory } from "./story";
import { SpinnerBasic as Preview, initialArgs } from "@/demos/stories/spinner";
export const story = defineStory({
  displayName: "Spinner",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
