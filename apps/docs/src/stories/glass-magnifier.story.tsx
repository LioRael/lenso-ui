import { defineStory } from "./story";
import { GlassMagnifierStory } from "./previews/glass-magnifier";
export const story = defineStory({
  displayName: "GlassMagnifier",
  Component: GlassMagnifierStory,
  args: [
    {
      variant: "Default",
      initial: {
        width: 210,
        height: 150,
        radius: 75,
        label: "GlassMagnifier",
        draggable: true,
        animated: true,
      },
    },
  ],
});
