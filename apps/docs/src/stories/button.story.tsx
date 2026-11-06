import { defineStory } from "./story";
import { ButtonStory } from "./button";

export const story = defineStory({
  displayName: "Button",
  Component: ButtonStory,
  args: [
    {
      variant: "Outline",
      initial: {
        label: "Continue",
        variant: "outline",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
      },
    },
    {
      variant: "Primary",
      initial: {
        label: "Continue",
        variant: "primary",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
      },
    },
    {
      variant: "Ghost",
      initial: {
        label: "Continue",
        variant: "ghost",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
      },
    },
    {
      variant: "Loading",
      initial: {
        label: "Continue",
        variant: "primary",
        size: "md",
        disabled: false,
        isLoading: true,
        fullWidth: false,
      },
    },
  ],
});
