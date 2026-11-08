import { defineStory } from "./story";
import { GlassButtonStory } from "./glass-button";

export const story = defineStory({
  displayName: "GlassButton",
  Component: GlassButtonStory,
  args: [
    {
      variant: "Glass",
      initial: {
        label: "Continue",
        variant: "default",
        size: "lg",
        disabled: false,
        isLoading: false,
        fullWidth: false,
        destructive: false,
        tint: "",
        elastic: true,
      },
    },
    {
      variant: "Prominent",
      initial: {
        label: "Continue",
        variant: "prominent",
        size: "lg",
        disabled: false,
        isLoading: false,
        fullWidth: false,
        destructive: false,
        tint: "",
        elastic: true,
      },
    },
    {
      variant: "Loading",
      initial: {
        label: "Continue",
        variant: "prominent",
        size: "lg",
        disabled: false,
        isLoading: true,
        fullWidth: false,
        destructive: false,
        tint: "",
        elastic: true,
      },
    },
  ],
});
