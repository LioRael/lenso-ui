import { defineStory } from "./story";
import { SwitchStory } from "./switch";

export const story = defineStory({
  displayName: "Switch",
  Component: SwitchStory,
  args: [
    {
      variant: "On",
      initial: { label: "Notifications", size: "md", checked: true, disabled: false },
    },
    {
      variant: "Off",
      initial: { label: "Notifications", size: "md", checked: false, disabled: false },
    },
    {
      variant: "Disabled",
      initial: { label: "Notifications", size: "md", checked: true, disabled: true },
    },
  ],
});
