import { defineStory } from "./story";
import { MenuStory } from "./materials";
export const story = defineStory({
  displayName: "Menu",
  Component: MenuStory,
  args: [
    {
      variant: "Default",
      initial: {
        label: "Actions",
        open: false,
        morphTrigger: true,
        elastic: true,

        disabled: false,
        align: "end",
        submenuPresentation: "auto",
      },
    },
  ],
});
