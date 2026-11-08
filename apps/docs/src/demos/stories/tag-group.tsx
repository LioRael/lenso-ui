"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface TagGroupStoryProps extends Pick<
  StoryComponentProps<typeof TagGroup>,
  "disabled" | "size" | "variant" | "selectionMode"
> {}
export const initialArgs: TagGroupStoryProps = /* story-args:start */ {
  disabled: false,
  size: "md",
  variant: "default",
  selectionMode: "single",
}; /* story-args:end */

import { PlanetEarth, Rocket, ShoppingBag, SquareArticle } from "@gravity-ui/icons";
import { Tag, TagGroup } from "@lenso/ui";

export function TagGroupBasic(overrides: TagGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TagGroup aria-label="Tags" {...args}>
      <TagGroup.List>
        <Tag itemKey="default-news" textValue="News">
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
