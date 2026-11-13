"use client";

import { useRef, useState, type ReactNode } from "react";
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import { Button, GlassButton, GlassContainer, Link, Menu, Slider, ThemeScope } from "@lenso/ui";
import { Heart, Plus, Sliders } from "@gravity-ui/icons";
import { glassLab as s } from "@/styles/glass-lab.stylex";

function Piece({
  children,
  label,
  wide,
  onActivate,
}: {
  children: ReactNode;
  label: string;
  wide?: boolean;
  onActivate: () => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const moved = useRef(false);
  return (
    <GlassButton
      aria-label={label}
      size="lg"
      isIconOnly={!wide}
      xstyle={[s.piece, wide && s.wide]}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        moved.current = false;
        drag.current = { x: event.clientX, y: event.clientY, left: offset.x, top: offset.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x,
          dy = event.clientY - drag.current.y;
        if (Math.hypot(dx, dy) < 4 && !moved.current) return;
        moved.current = true;
        setOffset({
          x: Math.max(-100, Math.min(100, drag.current.left + dx)),
          y: Math.max(-90, Math.min(90, drag.current.top + dy)),
        });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
        moved.current = false;
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onClick={(event) => {
        if (moved.current) {
          event.preventDefault();
          moved.current = false;
          return;
        }
        onActivate();
      }}
      onKeyDown={(event) => {
        const direction = {
          ArrowLeft: [-12, 0],
          ArrowRight: [12, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
        }[event.key];
        if (!direction) return;
        event.preventDefault();
        setOffset(({ x, y }) => ({
          x: Math.max(-100, Math.min(100, x + direction[0]!)),
          y: Math.max(-90, Math.min(90, y + direction[1]!)),
        }));
      }}
    >
      {children}
    </GlassButton>
  );
}

export function GlassLab({ locale }: { locale: "en" | "cn" }) {
  const cn = locale === "cn";
  const [dark, setDark] = useState(false);
  const [tint, setTint] = useState(0.5);
  const [gap, setGap] = useState(6);
  const [scene, setScene] = useState(6);
  const [revision, setRevision] = useState(0);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const activate = () => {
    setMessage("");
    setCount((count) => count + 1);
  };
  return (
    <ThemeScope theme={dark ? "dark" : "light"} glassTint={tint} xstyle={s.root}>
      <header {...stylex.props(s.header)}>
        <Link render={<NextLink href={cn ? "/cn" : "/"} />}>
          {cn ? "返回首页" : "Back to home"}
        </Link>
        <Button variant="bordered" onClick={() => setDark(!dark)}>
          {dark ? (cn ? "浅色外观" : "Light appearance") : cn ? "深色外观" : "Dark appearance"}
        </Button>
      </header>
      <main id="main-content" {...stylex.props(s.main)}>
        <div {...stylex.props(s.intro)}>
          <h1 {...stylex.props(s.title)}>Liquid Glass</h1>
          <p {...stylex.props(s.description)}>
            {cn ? "拖动、靠近、按住，再松开。" : "Drag closer. Press, hold, and release."}
          </p>
        </div>
        <div {...stylex.props(s.layout)}>
          <section
            aria-label={cn ? "玻璃交互画布" : "Glass interaction canvas"}
            {...stylex.props(s.stage)}
          >
            <img
              src={`/assets/demo/photos/${scene}.jpg`}
              data-lenso-backdrop=""
              alt={cn ? "玻璃控件后的风景照片" : "A landscape behind the glass controls"}
              {...stylex.props(s.photo)}
            />
            <div {...stylex.props(s.topActions)}>
              <GlassButton
                onClick={() => setMessage(cn ? "已按下独立按钮" : "Standalone button activated")}
              >
                <Plus width={18} height={18} aria-hidden="true" />
                {cn ? "独立按钮" : "Standalone"}
              </GlassButton>
              <Menu.Root>
                <Menu.Trigger render={<GlassButton />}>
                  <Sliders width={18} height={18} aria-hidden="true" />
                  {cn ? "照片选项" : "Photo options"}
                </Menu.Trigger>
                <Menu.Content align="end" sideOffset={8}>
                  <Menu.Item
                    onClick={() => {
                      setScene(scene === 6 ? 3 : 6);
                      setMessage(cn ? "已切换照片" : "Photo changed");
                    }}
                  >
                    {cn ? "切换照片" : "Change photo"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setRevision((value) => value + 1);
                      setMessage(cn ? "已重置位置" : "Positions reset");
                    }}
                  >
                    {cn ? "重置位置" : "Reset positions"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setTint(0.5);
                      setMessage(cn ? "已恢复默认材质" : "Material reset");
                    }}
                  >
                    {cn ? "恢复默认材质" : "Reset material"}
                  </Menu.Item>
                </Menu.Content>
              </Menu.Root>
            </div>
            <GlassContainer spacing={28} xstyle={s.group(gap)} key={revision}>
              <Piece label={cn ? "拖动添加按钮" : "Drag add button"} onActivate={activate}>
                <Plus width={26} height={26} aria-hidden="true" />
              </Piece>
              <Piece
                label={cn ? "拖动收藏按钮" : "Drag favorite button"}
                wide
                onActivate={activate}
              >
                <Heart width={22} height={22} aria-hidden="true" />
                {cn ? "收藏" : "Favorite"}
              </Piece>
              <Piece label={cn ? "拖动调整按钮" : "Drag adjustments button"} onActivate={activate}>
                <Sliders width={24} height={24} aria-hidden="true" />
              </Piece>
            </GlassContainer>
            <p {...stylex.props(s.canvasHint)}>
              {cn
                ? "拖动按钮让玻璃相遇，也可以聚焦后使用方向键。"
                : "Drag the controls together, or focus one and use the arrow keys."}
            </p>
          </section>
          <aside {...stylex.props(s.controls)}>
            <h2 {...stylex.props(s.controlTitle)}>{cn ? "感受材质与形变" : "Feel the material"}</h2>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={tint}
              onValueChange={(value) => setTint(typeof value === "number" ? value : value[0]!)}
            >
              <Slider.Label>{cn ? "玻璃浓度" : "Glass tint"}</Slider.Label>
              <Slider.Control>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb aria-label={cn ? "玻璃浓度" : "Glass tint"} />
                </Slider.Track>
              </Slider.Control>
            </Slider>
            <div {...stylex.props(s.legend)}>
              <span>{cn ? "更清透" : "Clear"}</span>
              <span>{cn ? "更浓郁" : "Tinted"}</span>
            </div>
            <Slider
              min={0}
              max={56}
              step={1}
              value={gap}
              onValueChange={(value) => setGap(typeof value === "number" ? value : value[0]!)}
            >
              <Slider.Label>{cn ? "按钮间距" : "Control spacing"}</Slider.Label>
              <Slider.Control>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb aria-label={cn ? "按钮间距" : "Control spacing"} />
                </Slider.Track>
              </Slider.Control>
            </Slider>
            <div {...stylex.props(s.actions)}>
              <Button variant="prominent" onClick={() => setGap(gap > 20 ? 6 : 48)}>
                {gap > 20 ? (cn ? "聚拢" : "Bring together") : cn ? "分开" : "Separate"}
              </Button>
              <Button
                variant="bordered"
                onClick={() => {
                  setRevision((value) => value + 1);
                  setGap(6);
                  setTint(0.5);
                }}
              >
                {cn ? "重置" : "Reset"}
              </Button>
            </div>
            <p {...stylex.props(s.note)}>
              {cn
                ? "按住观察高光，移动观察融合。照片选项会从按钮形变展开。"
                : "Hold to follow the light. Move to see the merge. Photo options grows out of its button."}
            </p>
            <output aria-live="polite" {...stylex.props(s.output)}>
              {message || (cn ? `已触发 ${count} 次操作` : `${count} actions activated`)}
            </output>
          </aside>
        </div>
      </main>
    </ThemeScope>
  );
}
