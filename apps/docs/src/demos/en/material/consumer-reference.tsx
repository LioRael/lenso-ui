"use client";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Card, Surface, Toast, createToaster } from "@lenso/ui";
const s = stylex.create({
  gallery: { display: "grid", gap: 20, width: "100%", minWidth: 0 },
  scene: {
    position: "relative",
    isolation: "isolate",
    padding: 24,
    borderRadius: 24,
    minWidth: 0,
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(120deg,#0088ff,#b786d9 45%,#ffba71)",
  },
  dark: { backgroundImage: "linear-gradient(120deg,#103c68,#58436d 45%,#93502b)" },
  surface: { padding: 20, borderRadius: 20, display: "grid", gap: 12 },
  text: { margin: 0, color: "inherit" },
  controls: { position: "relative", display: "flex", gap: 8 },
  toastScene: { minHeight: 280 },
  viewport: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    width: "auto",
    transform: "none",
  },
});
function Queue({ container, chinese }: { container: HTMLElement; chinese: boolean }) {
  const [manager] = useState(() => createToaster());
  return (
    <>
      <div {...stylex.props(s.controls)}>
        <Button
          onClick={() =>
            manager({
              title: chinese ? "更改已保存" : "Changes saved",
              description: chinese
                ? "通知使用 Clear Glass 材料。"
                : "Notifications use Clear Glass material.",
              type: "success",
            })
          }
        >
          {chinese ? "显示通知" : "Show notification"}
        </Button>
      </div>
      <Toast.Region toaster={manager} container={container} xstyle={s.viewport}>
        {(item) => (
          <Toast key={item.id}>
            <Toast.Indicator />
            <Toast.Content>
              <Toast.Title />
              <Toast.Description />
            </Toast.Content>
            <Toast.Close aria-label={chinese ? "关闭通知" : "Close notification"} />
          </Toast>
        )}
      </Toast.Region>
    </>
  );
}
function Scene({
  family,
  theme,
  chinese,
}: {
  family: "card" | "surface" | "toast";
  theme: "light" | "dark";
  chinese: boolean;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-theme={theme}
      data-testid={`${family}-material-${theme}`}
      {...stylex.props(s.scene, family === "toast" && s.toastScene)}
    >
      <div
        aria-hidden="true"
        data-lenso-backdrop
        {...stylex.props(s.backdrop, theme === "dark" && s.dark)}
      />
      {family === "card" && (
        <Card variant="glass">
          <Card.Header>
            <Card.Title>{chinese ? "项目概览" : "Project overview"}</Card.Title>
            <Card.Description>
              {chinese
                ? "Medium Liquid Glass · 浮层内容卡片"
                : "Medium Liquid Glass · floating content card"}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <p {...stylex.props(s.text)}>
              {chinese
                ? "保留背景层次，同时承载较长内容。"
                : "A substantial panel that keeps the backdrop present."}
            </p>
          </Card.Content>
          <Card.Footer>
            <Button>{chinese ? "查看详情" : "View details"}</Button>
          </Card.Footer>
        </Card>
      )}
      {family === "surface" && (
        <Surface variant="glass" xstyle={s.surface}>
          <h3 {...stylex.props(s.text)}>{chinese ? "面板背景" : "Panel background"}</h3>
          <p {...stylex.props(s.text)}>
            {chinese
              ? "Thick 模糊材料，来自 Popover 的背景；不运行折射计算。"
              : "Thick blur material from the Popover background; no refraction renderer."}
          </p>
          <Button>{chinese ? "继续" : "Continue"}</Button>
        </Surface>
      )}
      {family === "toast" && container && (
        <>
          <Queue container={container} chinese={chinese} />
        </>
      )}
    </div>
  );
}
export function ConsumerReference({
  family,
  chinese = false,
}: {
  family: "card" | "surface" | "toast";
  chinese?: boolean;
}) {
  return (
    <div {...stylex.props(s.gallery)}>
      {(["light", "dark"] as const).map((theme) => (
        <Scene key={theme} family={family} theme={theme} chinese={chinese} />
      ))}
    </div>
  );
}
