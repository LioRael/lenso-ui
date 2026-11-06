import { defineStory } from "./story";
import { TabsStory } from "./materials";
export const story = defineStory({
  displayName: "Tabs",
  Component: TabsStory,
  args: [
    {
      variant: "Default",
      initial: {
        value: "overview",
        orientation: "horizontal",
        activateOnFocus: true,
      },
    },
  ],
});
