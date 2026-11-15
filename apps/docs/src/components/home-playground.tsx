"use client";

import { useState } from "react";
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import {
  ColorSwatchPicker,
  Link,
  Menu,
  parseColor,
  Popover,
  Slider,
  TextArea,
  ThemeScope,
  Toolbar,
} from "@lenso/ui";
import {
  Bold,
  Check,
  ChevronDown,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
} from "@gravity-ui/icons";
import { playground as s } from "@/styles/home-playground.stylex";
import type { Locale } from "@/lib/source";

const components = [
  ["TextArea", "textarea"],
  ["Toolbar", "toolbar"],
  ["Menu", "menu"],
  ["Popover", "popover"],
  ["Slider", "slider"],
  ["ColorSwatchPicker", "color-swatch-picker"],
] as const;

const papers = [
  { color: "#161618", ink: "#F5F5F7", theme: "dark", en: "Charcoal", cn: "深色" },
  { color: "#F3EFE6", ink: "#1D1D1F", theme: "light", en: "Warm white", cn: "米白" },
  { color: "#2350D8", ink: "#FFFFFF", theme: "dark", en: "Blue", cn: "蓝色" },
  { color: "#FF6A3D", ink: "#1D1D1F", theme: "light", en: "Orange", cn: "橙色" },
  { color: "#C9D8C5", ink: "#1D1D1F", theme: "light", en: "Sage", cn: "浅绿" },
] as const;

const alignments = [
  { value: "left", en: "Align left", cn: "左对齐", Icon: TextAlignLeft },
  { value: "center", en: "Align center", cn: "居中", Icon: TextAlignCenter },
  { value: "right", en: "Align right", cn: "右对齐", Icon: TextAlignRight },
] as const;

export function HomePlayground({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const [text, setText] = useState(cn ? "你好，\nLenso." : "Hello,\nLenso.");
  const [size, setSize] = useState(96);
  const [font, setFont] = useState("system");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center");
  const [bold, setBold] = useState(true);
  const [paper, setPaper] = useState<(typeof papers)[number]>(papers[0]);
  const fonts = [
    { value: "system", label: cn ? "系统字体" : "Sans" },
    { value: "serif", label: cn ? "衬线字体" : "Serif" },
    { value: "mono", label: cn ? "等宽字体" : "Mono" },
  ];
  return (
    <section
      aria-label={cn ? "排版演示" : "Typography playground"}
      data-home-playground=""
      {...stylex.props(s.root)}
    >
      <ThemeScope theme={paper.theme} xstyle={[s.stage, s.paper(paper.color, paper.ink)]}>
        <div {...stylex.props(s.header)}>
          <span {...stylex.props(s.caption)}>
            {cn ? "点击文字直接编辑" : "Click the words to edit"}
          </span>
          <ColorSwatchPicker
            aria-label={cn ? "纸张颜色" : "Paper color"}
            size="sm"
            xstyle={s.swatches}
            value={parseColor(paper.color)}
            onChange={(color) => {
              const hex = color.toString("hex").toUpperCase();
              setPaper(papers.find((item) => item.color === hex) ?? papers[0]);
            }}
          >
            {papers.map((item) => (
              <ColorSwatchPicker.Item
                key={item.color}
                color={item.color}
                aria-label={cn ? item.cn : item.en}
                xstyle={s.swatchTarget}
              >
                <ColorSwatchPicker.Swatch xstyle={s.swatch} />
                <ColorSwatchPicker.Indicator />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
        </div>
        <TextArea
          aria-label={cn ? "海报文字" : "Poster text"}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          maxLength={80}
          spellCheck={false}
          xstyle={[
            s.text(size),
            s.compactText(size),
            font === "serif" && s.serif,
            font === "mono" && s.mono,
            bold && s.bold,
            s.align(alignment),
          ]}
        />
        <Toolbar isAttached aria-label={cn ? "排版工具" : "Type tools"} xstyle={s.toolbar}>
          <Toolbar.Group aria-label={cn ? "字体" : "Typeface"}>
            <Menu>
              <Menu.Trigger
                morphSource="toolbar"
                render={<Toolbar.Button aria-label={cn ? "字体" : "Typeface"} xstyle={s.font} />}
              >
                {fonts.find((item) => item.value === font)?.label}
                <ChevronDown width={14} height={14} aria-hidden="true" />
              </Menu.Trigger>
              <Menu.Content side="top" collisionPadding={32} xstyle={s.fontMenu}>
                <Menu.RadioGroup value={font} onValueChange={setFont}>
                  {fonts.map((item) => (
                    <Menu.RadioItem key={item.value} value={item.value} closeOnSelect>
                      <Menu.ItemIndicator keepMounted xstyle={s.menuCheck}>
                        <Check width={14} height={14} />
                      </Menu.ItemIndicator>
                      <Menu.Item.Label>{item.label}</Menu.Item.Label>
                    </Menu.RadioItem>
                  ))}
                </Menu.RadioGroup>
              </Menu.Content>
            </Menu>
          </Toolbar.Group>
          <Toolbar.Separator xstyle={s.toolbarSeparator} />
          <Toolbar.Group aria-label={cn ? "字号" : "Size"}>
            <Popover>
              <Popover.Trigger
                render={
                  <Toolbar.Button
                    aria-label={cn ? `字号 ${size}` : `Size ${size}`}
                    xstyle={s.size}
                  />
                }
              >
                <span aria-hidden="true">{size}</span>
              </Popover.Trigger>
              <Popover.Content side="top" sideOffset={12} xstyle={s.sizePopover}>
                <Slider
                  value={size}
                  onValueChange={(value) => {
                    if (typeof value === "number") setSize(value);
                  }}
                  min={32}
                  max={140}
                  step={1}
                >
                  <Slider.Label>{cn ? "字号" : "Size"}</Slider.Label>
                  <Slider.Output />
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Fill />
                      <Slider.Thumb aria-label={cn ? "字号" : "Size"} />
                    </Slider.Track>
                  </Slider.Control>
                </Slider>
              </Popover.Content>
            </Popover>
          </Toolbar.Group>
          <Toolbar.Separator xstyle={s.toolbarSeparator} />
          <Toolbar.Group aria-label={cn ? "样式" : "Style"}>
            <Toolbar.Button
              isIconOnly
              aria-label={cn ? "粗体" : "Bold"}
              aria-pressed={bold}
              onClick={() => setBold(!bold)}
              xstyle={bold && s.pressed}
            >
              <Bold width={17} height={17} />
            </Toolbar.Button>
            {alignments.map(({ value, en, cn: label, Icon }) => (
              <Toolbar.Button
                key={value}
                isIconOnly
                aria-label={cn ? label : en}
                aria-pressed={alignment === value}
                onClick={() => setAlignment(value)}
                xstyle={alignment === value && s.pressed}
              >
                <Icon width={17} height={17} />
              </Toolbar.Button>
            ))}
          </Toolbar.Group>
        </Toolbar>
      </ThemeScope>
      <div {...stylex.props(s.componentLinks)}>
        <span {...stylex.props(s.componentsLabel)}>{cn ? "由这些组件组合" : "Built with"}</span>
        {components.map(([name, path]) => (
          <Link
            key={path}
            render={<NextLink href={`/${locale}/docs/react/components/${path}`} />}
            xstyle={s.componentLink}
          >
            {name}
          </Link>
        ))}
      </div>
    </section>
  );
}
