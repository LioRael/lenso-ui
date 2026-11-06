import { defineStory } from "./story";
import { InputStory } from "./materials";
export const story = defineStory({
  displayName: "Input",
  Component: InputStory,
  args: [
    {
      variant: "Default",
      initial: {
        value: "",
        placeholder: "Your name",
        disabled: false,
        readOnly: false,
      },
    },
    {
      variant: "Glass",
      initial: {
        value: "",
        placeholder: "Your name",
        disabled: false,
        readOnly: false,
      },
    },
    {
      variant: "Glass and elastic",
      initial: {
        value: "",
        placeholder: "Press to focus",
        disabled: false,
        readOnly: false,
      },
    },
  ],
});
