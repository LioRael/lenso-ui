import { defineStory } from "./story";
import { GlassContainerStory } from "./glass-container";

export const story = defineStory({
  displayName: "GlassContainer",
  Component: GlassContainerStory,
  args: [{ variant: "Fusion", initial: { spacing: 18, gap: 12, elastic: true, disabled: false } }],
});
