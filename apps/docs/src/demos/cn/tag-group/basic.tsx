// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 tag-group-basic (Apache-2.0).
import { PlanetEarth, Rocket, ShoppingBag, SquareArticle } from "@gravity-ui/icons";
import { Tag, TagGroup } from "@lenso/ui";
export function TagGroupBasic() {
  return (
    <TagGroup aria-label="标签" selectionMode="single">
      <TagGroup.List>
        <Tag itemKey="default-news" textValue="资讯">
          <SquareArticle width={12} height={12} />
          资讯
        </Tag>
        <Tag itemKey="default-travel" textValue="旅行">
          <PlanetEarth width={12} height={12} />
          旅行
        </Tag>
        <Tag itemKey="default-gaming" textValue="游戏">
          <Rocket width={12} height={12} />
          游戏
        </Tag>
        <Tag itemKey="default-shopping" textValue="购物">
          <ShoppingBag width={12} height={12} />
          购物
        </Tag>
      </TagGroup.List>
    </TagGroup>
  );
}
