import { defineStory } from "./story";
import { ButtonStory } from "./button";

export const story = defineStory({
  displayName: "Button",
  Component: ButtonStory,
  args: [
    {
      variant: "Bordered",
      initial: {
        label: "Continue",
        variant: "bordered",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
        destructive: false,
        tint: "",
      },
    },
    {
      variant: "Prominent",
      initial: {
        label: "Continue",
        variant: "prominent",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
        destructive: false,
        tint: "",
      },
    },
    {
      variant: "Borderless",
      initial: {
        label: "Continue",
        variant: "borderless",
        size: "md",
        disabled: false,
        isLoading: false,
        fullWidth: false,
        destructive: false,
        tint: "",
      },
    },
    {
      variant: "Loading",
      initial: {
        label: "Continue",
        variant: "prominent",
        size: "md",
        disabled: false,
        isLoading: true,
        fullWidth: false,
        destructive: false,
        tint: "",
      },
    },
  ],
});
