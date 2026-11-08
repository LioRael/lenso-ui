import { defineStory } from "./story";
import { ActionSheetStory } from "./action-sheet-demo";
export const story = defineStory({
  displayName: "ActionSheet",
  Component: ActionSheetStory,
  args: [
    {
      variant: "Default",
      initial: { placement: "center", dim: true, message: true, destructive: true },
    },
  ],
});
