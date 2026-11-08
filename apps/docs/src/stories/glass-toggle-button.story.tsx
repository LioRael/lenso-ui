import { defineStory } from "./story";
import { GlassToggleButtonStory } from "./glass-toggle-button";

export const story = defineStory({
  displayName: "GlassToggleButton",
  Component: GlassToggleButtonStory,
  args: [
    {
      variant: "Glass",
      initial: {
        size: "lg",
        variant: "default",
        defaultPressed: false,
        disabled: false,
        elastic: true,
        isIconOnly: false,
      },
    },
    {
      variant: "Selected",
      initial: {
        size: "lg",
        variant: "default",
        defaultPressed: true,
        disabled: false,
        elastic: true,
        isIconOnly: false,
      },
    },
    {
      variant: "Icon",
      initial: {
        size: "md",
        variant: "default",
        defaultPressed: false,
        disabled: false,
        elastic: true,
        isIconOnly: true,
      },
    },
  ],
});
