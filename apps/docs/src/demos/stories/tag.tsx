"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface TagStoryProps extends Pick<StoryComponentProps<typeof Tag>, "disabled"> {}
export const initialArgs: TagStoryProps = /* story-args:start */ {
  disabled: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 tag-group-basic (Apache-2.0).
import { PlanetEarth, Rocket, ShoppingBag, SquareArticle } from "@gravity-ui/icons";
import { Tag, TagGroup } from "@lenso/ui";

export function TagGroupBasic(overrides: TagStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TagGroup aria-label="Tags" selectionMode="single">
      <TagGroup.List>
        <Tag itemKey="default-news" textValue="News" {...args}>
          <SquareArticle width={12} height={12} />
          News
        </Tag>
        <Tag itemKey="default-travel" textValue="Travel">
          <PlanetEarth width={12} height={12} />
          Travel
        </Tag>
        <Tag itemKey="default-gaming" textValue="Gaming">
          <Rocket width={12} height={12} />
          Gaming
        </Tag>
        <Tag itemKey="default-shopping" textValue="Shopping">
          <ShoppingBag width={12} height={12} />
          Shopping
        </Tag>
      </TagGroup.List>
    </TagGroup>
  );
}
