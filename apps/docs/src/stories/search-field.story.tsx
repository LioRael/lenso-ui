import { defineStory } from "./story";
import { SearchFieldStory } from "./materials";
export const story = defineStory({
  displayName: "SearchField",
  Component: SearchFieldStory,
  args: [
    {
      variant: "Default",
      initial: { value: "", placeholder: "Search", disabled: false, readOnly: false },
    },
  ],
});
