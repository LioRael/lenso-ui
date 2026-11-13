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
      variant: "With icon",
      initial: { label: "Add member", variant: "bordered", example: "with-icon" },
    },
    {
      variant: "Icon only",
      initial: { label: "Settings", variant: "bordered", example: "icon-only" },
    },
    {
      variant: "Async action",
      initial: { label: "Save changes", variant: "prominent", example: "async" },
    },
    {
      variant: "Form submit",
      initial: { label: "Subscribe", variant: "prominent", example: "form" },
    },
    {
      variant: "Custom element",
      initial: { label: "Custom button", variant: "bordered", example: "render" },
    },
    {
      variant: "Destructive",
      initial: { label: "Delete", variant: "prominent", destructive: true, example: "with-icon" },
    },
  ],
});
