"use client";
import * as stylex from "@stylexjs/stylex";
import { GlassButton } from "@lenso/ui/glass-button";
import { ListBox } from "@lenso/ui/list-box";
import { Slider } from "@lenso/ui/slider";
import { presetPreview, themes } from "./docs-theme-presets";
import { docsThemePicker as s } from "@lenso/docs/presentation";
import { isDocsDesignTheme, useDocsDesignTheme } from "./docs-design-theme-context";
export default function DocsThemePanel({ locale }: { locale: "en" | "cn" }) {
  const { active, setActive, glassTint: tint, setGlassTint: setTint } = useDocsDesignTheme();
  const cn = locale === "cn";
  return (
    <>
      {" "}
      <div {...stylex.props(s.materialSection)}>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={tint}
          onValueChange={(value) => setTint(typeof value === "number" ? value : (value[0] ?? 0.5))}
        >
          <Slider.Label>{cn ? "玻璃外观" : "Glass appearance"}</Slider.Label>
          <Slider.Control>
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb aria-label={cn ? "全局玻璃外观" : "Global glass appearance"} />
            </Slider.Track>
          </Slider.Control>
        </Slider>
        <div {...stylex.props(s.glassLegend)}>
          <span>{cn ? "更清透" : "More clear"}</span>
          <span>{cn ? "默认" : "Default"}</span>
          <span>{cn ? "更浓染" : "More tinted"}</span>
        </div>
        <GlassButton size="sm" onClick={() => setTint(0.5)}>
          {cn ? "恢复默认玻璃外观" : "Reset glass appearance"}
        </GlassButton>
      </div>
      <ListBox
        aria-label={cn ? "主题预设" : "Theme presets"}

        value={active}
        onValueChange={(id) => {
          if (isDocsDesignTheme(id)) setActive(id);
        }}
        xstyle={s.presets}
      >
        {themes.map((theme) => {
          const swatch = stylex.props(s.swatch, active === theme.id && s.selectedSwatch);
          return (
            <ListBox.Item
              key={theme.id}
              value={theme.id}
              label={theme.label}
              aria-label={`Apply ${theme.label} theme`}
              xstyle={[s.item, active === theme.id && s.selectedItem]}
            >
              <span
                {...swatch}
                aria-hidden="true"
                style={{ ...swatch.style, backgroundImage: presetPreview(theme.variables) }}
              />
              <span {...stylex.props(s.label)}>{theme.label}</span>
            </ListBox.Item>
          );
        })}
      </ListBox>
    </>
  );
}
