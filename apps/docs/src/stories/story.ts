import { defineStoryFactory } from "@fumadocs/story/vite/client";
import { StoryPanel } from "./story-panel";

export const { defineStory } = defineStoryFactory({ WithControl: StoryPanel });
