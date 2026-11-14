"use client";

import { useState } from "react";
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  Link,
  Select,
  Slider,
  Switch,
  TextArea,
  ThemeScope,
  ToggleButton,
  ToggleButtonGroup,
} from "@lenso/ui";
import { Bold, TextAlignLeft, TextAlignCenter, TextAlignRight } from "@gravity-ui/icons";
import { playground as s } from "@/styles/home-playground.stylex";
import type { Locale } from "@/lib/source";

const components = [
  ["TextArea", "textarea"],
  ["Slider", "slider"],
  ["Select", "select"],
  ["ToggleButtonGroup", "toggle-button-group"],
  ["Switch", "switch"],
] as const;

export function HomePlayground({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const initialText = cn ? "你好，\nLenso." : "Hello,\nLenso.";
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState(88);
  const [font, setFont] = useState<string | null>("system");
  const [alignment, setAlignment] = useState(["left"]);
  const [bold, setBold] = useState(false);
  const [dark, setDark] = useState(true);
  const fonts = [
    { value: "system", label: cn ? "系统字体" : "System sans" },
    { value: "serif", label: cn ? "衬线字体" : "Editorial serif" },
    { value: "mono", label: cn ? "等宽字体" : "Monospace" },
  ];
  return (
    <section
      aria-label={cn ? "排版演示" : "Typography playground"}
      data-home-playground=""
      {...stylex.props(s.root)}
    >
      <div {...stylex.props(s.composition)}>
        <ThemeScope theme={dark ? "dark" : "light"} xstyle={s.canvas}>
          <div {...stylex.props(s.canvasHeading)}>
            <span>{cn ? "直接编辑" : "Type something"}</span>
            <span aria-hidden="true">Aa</span>
          </div>
          <TextArea
            aria-label={cn ? "画布文字" : "Canvas text"}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            maxLength={80}
            spellCheck={false}
            xstyle={[
              s.text(size),
              font === "serif" && s.serif,
              font === "mono" && s.mono,
              bold && s.bold,
              alignment[0] === "center" && s.center,
              alignment[0] === "right" && s.right,
            ]}
          />
          <div {...stylex.props(s.canvasFooter)}>
            <span>
              {font === "serif" ? "Georgia" : font === "mono" ? "Monospace" : "System"} · {size} px
            </span>
            <span>{text.length} / 80</span>
          </div>
        </ThemeScope>
        <div {...stylex.props(s.controls)}>
          <div {...stylex.props(s.controlHeading)}>
            <h2 {...stylex.props(s.title)}>{cn ? "排版试验" : "Type playground"}</h2>
            <p {...stylex.props(s.description)}>
              {cn ? "编辑文字，试试这些控件。" : "Edit the text. Change the controls."}
            </p>
          </div>
          <Select.Root items={fonts} value={font} onValueChange={setFont}>
            <Select.Label>{cn ? "字体" : "Typeface"}</Select.Label>
            <Select.Trigger xstyle={s.select}>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Content>
              <Select.List>
                {fonts.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Content>
          </Select.Root>
          <Slider
            value={size}
            onValueChange={(value) => {
              if (typeof value === "number") setSize(value);
            }}
            min={24}
            max={120}
            step={1}
            xstyle={s.slider}
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
          <div {...stylex.props(s.formatting)}>
            <ToggleButtonGroup
              aria-label={cn ? "文字对齐" : "Text alignment"}
              value={alignment}
              onValueChange={setAlignment}
            >
              {[
                { value: "left", label: cn ? "左对齐" : "Align left", Icon: TextAlignLeft },
                { value: "center", label: cn ? "居中" : "Align center", Icon: TextAlignCenter },
                { value: "right", label: cn ? "右对齐" : "Align right", Icon: TextAlignRight },
              ].map(({ value, label, Icon }) => (
                <ToggleButton key={value} value={value} isIconOnly aria-label={label}>
                  <ToggleButton.Icon>
                    <Icon />
                  </ToggleButton.Icon>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButton
              pressed={bold}
              onPressedChange={setBold}
              isIconOnly
              aria-label={cn ? "粗体" : "Bold"}
            >
              <ToggleButton.Icon>
                <Bold />
              </ToggleButton.Icon>
            </ToggleButton>
          </div>
          <div {...stylex.props(s.appearance)}>
            <Switch checked={dark} onCheckedChange={setDark}>
              <Switch.Content xstyle={s.switchContent}>
                <span>{cn ? "深色画布" : "Dark canvas"}</span>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
            <Button
              variant="bordered"
              xstyle={s.reset}
              onClick={() => {
                setText(initialText);
                setSize(88);
                setFont("system");
                setAlignment(["left"]);
                setBold(false);
                setDark(true);
              }}
            >
              {cn ? "重置演示" : "Reset playground"}
            </Button>
          </div>
        </div>
      </div>
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
