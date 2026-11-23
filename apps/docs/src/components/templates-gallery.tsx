"use client";

import { lazy, Suspense, useId, useState } from "react";
import { Button, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { Locale } from "../lib/locale";

const DeviceLab = lazy(() =>
  import("./device-lab").then(({ DeviceLab }) => ({ default: DeviceLab })),
);
const apps = ["photos", "music"] as const;

const copy = {
  en: {
    gallery: "App templates",
    preview: "Duo preview",
    hint: "Choose an app to try its inner and cover layouts on the foldable Duo.",
    loading: "Loading Duo preview…",
    web: "Open on the web",
    duo: "Preview in Duo",
    docs: "Documentation",
    photos: {
      name: "Photos",
      description: "Browse, search, and edit a responsive photo library.",
      web: "Open Photos on the web",
      duo: "Preview Photos in Duo",
      docs: "Photos documentation",
    },
    music: {
      name: "Music",
      description: "Play tracks, browse albums, and manage the queue.",
      web: "Open Music on the web",
      duo: "Preview Music in Duo",
      docs: "Music documentation",
    },
  },
  cn: {
    gallery: "应用模板",
    preview: "Duo 预览",
    hint: "选择一个应用，在 Duo 上体验折叠后的外屏和展开后的内屏。",
    loading: "正在加载 Duo 预览…",
    web: "在网页打开",
    duo: "在 Duo 中体验",
    docs: "模板说明",
    photos: {
      name: "Photos",
      description: "浏览、搜索和编辑响应式照片库。",
      web: "在网页打开照片",
      duo: "在 Duo 中体验照片",
      docs: "照片模板说明",
    },
    music: {
      name: "Music",
      description: "浏览专辑和歌单，播放歌曲并管理播放队列。",
      web: "在网页打开音乐",
      duo: "在 Duo 中体验音乐",
      docs: "音乐模板说明",
    },
  },
};

const s = stylex.create({
  gallery: { display: "grid", gap: 24, minWidth: 0 },
  catalog: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 268px), 1fr))",
    gap: 12,
  },
  card: {
    display: "grid",
    alignContent: "start",
    gap: 12,
    minWidth: 0,
    padding: 16,
    border: "1px solid var(--lenso-separator)",
    borderRadius: 14,
    backgroundColor: "var(--lenso-background-secondary)",
  },
  active: { borderColor: "var(--lenso-label-secondary)" },
  cardTitle: { margin: 0, fontSize: 20, lineHeight: 1.25, fontWeight: 650 },
  summary: {
    margin: 0,
    color: "color-mix(in srgb, var(--lenso-label-primary) 75%, var(--lenso-background-secondary))",
    fontSize: 14,
    lineHeight: 1.5,
  },
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 },
  web: { display: "inline-flex", alignItems: "center", minHeight: 44, paddingInline: 8 },
  launch: { minHeight: 44 },
  docs: { justifySelf: "start", fontSize: 14 },
  preview: {
    minWidth: 0,
    overflow: "clip",
    border: "1px solid var(--lenso-separator)",
    borderRadius: 14,
  },
  previewHeader: { paddingBlock: 12, paddingInline: 16 },
  previewTitle: { margin: 0, fontSize: 16, fontWeight: 600 },
  previewStage: { height: "clamp(400px, 62svh, 570px)" },
  previewHint: {
    margin: 0,
    paddingBlockEnd: 16,
    paddingInline: 16,
    color: "color-mix(in srgb, var(--lenso-label-primary) 75%, var(--lenso-background-primary))",
  },
});

export function TemplatesGallery({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<(typeof apps)[number] | null>(null);
  const previewId = useId();
  const t = copy[locale];
  return (
    <section aria-label={t.gallery} {...stylex.props(s.gallery)}>
      <div {...stylex.props(s.catalog)}>
        {apps.map((app) => (
          <div key={app} {...stylex.props(s.card, active === app && s.active)}>
            <h2 {...stylex.props(s.cardTitle)}>{t[app].name}</h2>
            <p {...stylex.props(s.summary)}>{t[app].description}</p>
            <div {...stylex.props(s.actions)}>
              <Link href={`/${locale}/${app}`} aria-label={t[app].web} xstyle={s.web}>
                {t.web}
              </Link>
              <Button
                variant={active === app ? "prominent" : "bordered"}
                aria-label={t[app].duo}
                aria-controls={previewId}
                aria-pressed={active === app}
                onClick={() => setActive(active === app ? null : app)}
                xstyle={s.launch}
              >
                {t.duo}
              </Button>
            </div>
            <Link
              href={`/${locale}/docs/react/templates/${app}`}
              aria-label={t[app].docs}
              xstyle={s.docs}
            >
              {t.docs}
            </Link>
          </div>
        ))}
      </div>
      <section id={previewId} aria-label={t.preview} {...stylex.props(s.preview)}>
        <header {...stylex.props(s.previewHeader)}>
          <h2 {...stylex.props(s.previewTitle)}>
            {t.preview}
            {active && ` · ${t[active].name}`}
          </h2>
        </header>
        {active ? (
          <div {...stylex.props(s.previewStage)}>
            <Suspense fallback={<output {...stylex.props(s.previewHint)}>{t.loading}</output>}>
              <DeviceLab key={active} app={active} locale={locale} embedded />
            </Suspense>
          </div>
        ) : (
          <p {...stylex.props(s.previewHint)}>{t.hint}</p>
        )}
      </section>
    </section>
  );
}
