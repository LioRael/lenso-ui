"use client";
import { defineStoryFactory } from "@fumadocs/story/next/client";
import { StoryPanel } from "./story-panel";

export const { defineStory } = defineStoryFactory({ WithControl: StoryPanel });
