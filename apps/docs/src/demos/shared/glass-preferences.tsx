"use client";
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The named scroll viewport needs focus for native keyboard scrolling. */

import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ThemeScope, Toolbar, Input, Glass } from "@lenso/ui";

const styles = stylex.create({
  root: { width: "100%", maxWidth: 560 },
  settings: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 16 },
  viewport: { position: "relative", height: 280, overflow: "auto", borderRadius: 20 },
  scene: { position: "relative", minHeight: "100%" },
  backdrop: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage:
      "linear-gradient(120deg, color-mix(in srgb, var(--lenso-background-primary) 85%, #587091), color-mix(in srgb, var(--lenso-background-primary) 85%, #b3cad4) 45%, color-mix(in srgb, var(--lenso-background-primary) 85%, #c9a68c))",
  },
  content: {
    position: "relative",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: 24,
  },
  glass: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    boxSizing: "border-box",
    fontSize: 14,
    lineHeight: "22px",
  },
  heading: { marginTop: 0, marginBottom: 8, fontSize: 15 },
  paragraph: { margin: 0 },
  value: { fontVariantNumeric: "tabular-nums" },
});

export function GlassPreferences({ locale }: { locale: "en" | "cn" }) {
  const cn = locale === "cn";
  const [amount, setAmount] = useState(0.5);
  const [override, setOverride] = useState(false);
  const [edge, setEdge] = useState<"uniform" | "soft" | "none">("uniform");
  const [page, setPage] = useState(1);
  const scroll = useRef<HTMLDivElement>(null);
  return (
    <ThemeScope glassTint={override ? amount : undefined} xstyle={styles.root}>
      <div {...stylex.props(styles.settings)}>
        <label>
          <input
            type="checkbox"
            checked={override}
            onChange={(event) => setOverride(event.target.checked)}
          />
          {cn ? "覆盖全局玻璃外观" : "Override global glass appearance"}
        </label>
        <label>
          {cn ? "局部玻璃外观" : "Local glass appearance"}{" "}
          <input
            aria-label={cn ? "局部玻璃外观" : "Local glass appearance"}
            disabled={!override}
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />{" "}
          <output {...stylex.props(styles.value)}>{amount.toFixed(1)}</output>
        </label>
        <label>
          {cn ? "滚动边缘" : "Scroll edge"}{" "}
          <select
            aria-label={cn ? "滚动边缘" : "Scroll edge"}
            value={edge}
            onChange={(event) => setEdge(event.target.value as typeof edge)}
          >
            <option value="uniform">Uniform</option>
            <option value="soft">Soft</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>
      <section
        ref={scroll}
        {...stylex.props(styles.viewport)}
        aria-label={cn ? "工具栏滚动预览" : "Toolbar scroll preview"}
        tabIndex={0}
      >
        <div {...stylex.props(styles.scene)}>
          <div data-lenso-backdrop {...stylex.props(styles.backdrop)} />
          <Toolbar edge={edge} scrollRef={scroll} aria-label={cn ? "翻页操作" : "Page actions"}>
            <Toolbar.Group>
              <Toolbar.Button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                {cn ? "上一页" : "Previous"}
              </Toolbar.Button>
              <Toolbar.Button onClick={() => setPage((value) => value + 1)}>
                {cn ? "下一页" : "Next"}
              </Toolbar.Button>
            </Toolbar.Group>
          </Toolbar>
          <div {...stylex.props(styles.content)}>
            <output aria-live="polite">
              {cn ? "当前页" : "Current page"}: {page}
            </output>
            <Input
              aria-label={cn ? "页面标题" : "Page title"}
              placeholder={cn ? "输入标题" : "Enter a title"}
            />
            <Glass xstyle={styles.glass}>
              <h4 {...stylex.props(styles.heading)}>{cn ? "滚动背景" : "Scroll background"}</h4>
              <p {...stylex.props(styles.paragraph)}>
                {cn
                  ? "滚动时，背景带保持文字清晰。"
                  : "The background band keeps actions readable while content scrolls."}
              </p>
            </Glass>
            <Glass xstyle={styles.glass}>
              <h4 {...stylex.props(styles.heading)}>{cn ? "清晰文字" : "Readable text"}</h4>
              <p {...stylex.props(styles.paragraph)}>
                {cn
                  ? "默认跟随主题菜单中的全局玻璃外观。开启局部覆盖后，仅此预览采用独立设置；文字与操作保持清晰。"
                  : "This preview follows the global glass appearance in the Theme menu. Enable a local override to adjust this preview independently; text and actions remain opaque."}
              </p>
            </Glass>
          </div>
        </div>
      </section>
    </ThemeScope>
  );
}
