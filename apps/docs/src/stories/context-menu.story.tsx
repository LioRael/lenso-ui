import { defineStory } from "./story";
import { ContextMenuStory } from "./context-menu-demo";
export const story = defineStory({
  displayName: "ContextMenu",
  Component: ContextMenuStory,
  args: [
    {
      variant: "Default",
      initial: {
        elastic: true,
        compact: false,
        preview: true,
        layout: "vertical",
        previewAlign: "leading",
        dim: true,
      },
    },
  ],
});
