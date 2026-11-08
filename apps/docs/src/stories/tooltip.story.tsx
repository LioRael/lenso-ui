import { defineStory } from "./story";
import { TooltipBasic as Preview, initialArgs } from "@/demos/stories/tooltip";
export const story = defineStory({
  displayName: "Tooltip",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
