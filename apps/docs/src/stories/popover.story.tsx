import { defineStory } from "./story";
import { PopoverBasic as Preview, initialArgs } from "@/demos/stories/popover";
export const story = defineStory({
  displayName: "Popover",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
