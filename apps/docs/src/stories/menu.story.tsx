import { defineStory } from "./story";
import { MenuStory } from "./previews/menu";
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
        presentation: "popup",
        disabled: false,
        align: "end",
        submenuPresentation: "auto",
      },
    },
  ],
});
