import { defineStory } from "./story";
import { GlassStory } from "./materials";
export const story = defineStory({
  displayName: "Glass",
  Component: GlassStory,
  args: [
    {
      variant: "Default",
      initial: {
        width: 210,
        height: 150,
        radius: 75,
        label: "Glass",
      },
    },
  ],
});
