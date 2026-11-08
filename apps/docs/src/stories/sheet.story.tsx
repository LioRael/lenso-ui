import { defineStory } from "./story";
import { SheetStory } from "./sheet-demo";

export const story = defineStory({
  displayName: "Sheet",
  Component: SheetStory,
  args: [
    {
      variant: "Default",
      initial: { detent: "medium", dim: true, grabber: true, threeStage: true },
    },
    {
      variant: "Standard two stops",
      initial: { detent: "medium", dim: true, grabber: true, threeStage: false },
    },
  ],
});
