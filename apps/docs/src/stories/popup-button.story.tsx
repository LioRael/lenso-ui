import { defineStory } from "./story";
import { Preview } from "@/demos/stories/popup-button";

export const story = defineStory({
  displayName: "PopupButton",
  Component: Preview,
  args: [
    {
      variant: "Default",
      initial: { label: "Label", disabled: false, example: "button" },
    },
    {
      variant: "With Select",
      initial: { label: "Label", disabled: false, example: "select" },
    },
    {
      variant: "Below trigger",
      initial: { label: "Label", disabled: false, example: "select-below" },
    },
    {
      variant: "With Menu",
      initial: { label: "Actions", disabled: false, example: "menu" },
    },
    {
      variant: "Disabled",
      initial: { label: "Label", disabled: true, example: "button" },
    },
  ],
});
