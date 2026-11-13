import { defineStory } from "./story";
import { TabsStory } from "./previews/tabs";
export const story = defineStory({
  displayName: "Tabs",
  Component: TabsStory,
  args: [
    {
      variant: "Default",
      initial: {
        value: "overview",
        orientation: "horizontal",
        activation: "automatic",
        lift: 20,
        elastic: true,
        glass: true,
        size: "sm",
      },
    },
  ],
});
