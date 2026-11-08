import { defineStory } from "./story";
import { ShareSheetStory } from "./share-sheet";
export const story = defineStory({
  displayName: "ShareSheet",
  Component: ShareSheetStory,
  args: [{ variant: "Default", initial: { dim: true } }],
});
