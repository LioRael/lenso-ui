"use client";

// Copyright 2025 NextUI Inc. SPDX-License-Identifier: Apache-2.0.
// Modified: a focused photo example using Lenso glass controls and native tabs.
// License: THIRD_PARTY_NOTICES.md.
import { useState } from "react";
import { GlassToggleButton, Tabs, ThemeScope } from "@lenso/ui";
import { Heart } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { homeShowcase as s } from "@/styles/home-showcase.stylex";

const scenes = [
  {
    id: "alpine",
    image: 6,
    en: "Alpine",
    cn: "山湖",
    title: "A moment of stillness.",
    titleCn: "留一点时间，给眼前。",
    alt: "An alpine lake surrounded by mountains",
    altCn: "群山环绕的高山湖泊",
  },
  {
    id: "forest",
    image: 3,
    en: "Forest",
    cn: "森林",
    title: "Take the quieter path.",
    titleCn: "沿着光，走进森林。",
    alt: "Sunlight falling through a green forest",
    altCn: "阳光穿过绿色森林",
  },
  {
    id: "coast",
    image: 10,
    en: "Coast",
    cn: "海岸",
    title: "Room to breathe.",
    titleCn: "向着海，慢下来。",
    alt: "A sandy beach beside a turquoise sea",
    altCn: "碧蓝海水旁的沙滩",
  },
] as const;

export function HomeShowcase({ locale }: { locale: "en" | "cn" }) {
  const cn = locale === "cn";
  const [favorites, setFavorites] = useState<string[]>([]);
  return (
    <figure {...stylex.props(s.figure)}>
      <ThemeScope theme="dark" data-home-showcase="" xstyle={s.scope}>
        <Tabs defaultValue="alpine" glass xstyle={s.root}>
          <div data-lenso-backdrop="" {...stylex.props(s.backdrop)}>
            {scenes.map((scene) => (
              <Tabs.Panel key={scene.id} value={scene.id} xstyle={s.panel}>
                <img
                  src={`/assets/demo/photos/${scene.image}.jpg`}
                  alt={cn ? scene.altCn : scene.alt}
                  fetchPriority={scene.id === "alpine" ? "high" : "auto"}
                  {...stylex.props(s.photo)}
                />
                <div {...stylex.props(s.shade)} aria-hidden="true" />
                <div {...stylex.props(s.photoHeading)}>
                  <span {...stylex.props(s.photoLabel)}>
                    {cn ? "风景集" : "The landscape collection"}
                  </span>
                  <GlassToggleButton
                    size="lg"
                    isIconOnly
                    aria-label={cn ? `收藏${scene[locale]}照片` : `Favorite ${scene.en} photo`}
                    pressed={favorites.includes(scene.id)}
                    onPressedChange={(pressed) =>
                      setFavorites((current) =>
                        pressed ? [...current, scene.id] : current.filter((id) => id !== scene.id),
                      )
                    }
                  >
                    <Heart
                      width={20}
                      height={20}
                      fill={favorites.includes(scene.id) ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </GlassToggleButton>
                </div>
                <div {...stylex.props(s.photoCopy)}>
                  <p {...stylex.props(s.photoTitle)}>{cn ? scene.titleCn : scene.title}</p>
                </div>
              </Tabs.Panel>
            ))}
          </div>
          <Tabs.ListContainer
            xstyle={s.navigation}
            overflowLabel={cn ? "更多风景" : "More landscapes"}
          >
            <Tabs.List aria-label={cn ? "选择风景" : "Choose a landscape"} xstyle={s.tabList}>
              {scenes.map((scene) => (
                <Tabs.Tab key={scene.id} value={scene.id} xstyle={s.tab}>
                  {scene[locale]}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </ThemeScope>
    </figure>
  );
}
