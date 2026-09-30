"use client";

// Adapted from HeroUI v3.2.6 tag-group-basic (Apache-2.0).
import { PlanetEarth, Rocket, ShoppingBag, SquareArticle } from "@gravity-ui/icons";
import { Tag, TagGroup } from "@lenso/ui";

export function TagGroupBasic() {
  return (
    <TagGroup aria-label="Tags" selectionMode="single">
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
