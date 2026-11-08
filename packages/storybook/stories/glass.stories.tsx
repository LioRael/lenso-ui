import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { GlassButton, Button, Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  page: {
    // Darker than the reference's blue so white action labels meet AA in this review scene.
    "--lenso-focus-ring": "#0066cc",
    width: "min(960px, 100%)",
    marginInline: "auto",
    padding: { default: 24, "@media (min-width: 700px)": 48 },
    color: "var(--lenso-label-primary)",
    backgroundColor: "var(--lenso-background-primary)",
    minHeight: "100vh",
    fontFamily: "var(--lenso-font-body)",
  },
  header: { marginBottom: 32, maxWidth: 580 },
  title: { fontSize: 32, fontWeight: 600, letterSpacing: "-.04em", marginBottom: 12 },
  text: { fontSize: 15, lineHeight: 1.7 },
  scene: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 300,
    padding: 28,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#183f8b",
    // Broad edges reveal the lens's displacement without borrowing demo images.
    backgroundImage:
      "linear-gradient(138deg, #102655 0%, #234d9f 36%, #b5d4fa 36.5%, #467dc1 39%, #152e67 67%, #3f70b1 68%, #122956 100%)",
  },
  sceneTitle: {
    color: "var(--lenso-constant-white)",
    fontSize: 24,
    fontWeight: 500,
    maxWidth: 280,
  },
  actions: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" },
  settings: { marginTop: 28, paddingBlock: 24, borderBlock: "1px solid var(--lenso-separator)" },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  label: { fontSize: 16, fontWeight: 500 },
  note: { fontSize: 14, lineHeight: 1.6, marginTop: 6 },
  status: { display: "block", minHeight: 24, marginTop: 20, fontSize: 14 },
  states: { marginTop: 28, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" },
});

function Review() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("预览尚未保存。");
  const [saving, setSaving] = useState(false);
  return (
    <main {...stylex.props(s.page)}>
      <header {...stylex.props(s.header)}>
        <h1 {...stylex.props(s.title)}>Lenso Glass</h1>
        <p {...stylex.props(s.text)}>
          玻璃材质承载操作，内容保持清晰。这是 Button 与 Switch
          的首个重构预览，所有操作仅改变本地演示状态。
        </p>
      </header>
      <section aria-label="玻璃按钮预览" {...stylex.props(s.scene)}>
        <h2 {...stylex.props(s.sceneTitle)}>让背景穿过操作表面。</h2>
        <div {...stylex.props(s.actions)}>
          <GlassButton variant="default" onClick={() => setMessage("已打开材质预览。")}>
            预览材质
          </GlassButton>
          <GlassButton
            variant="default"
            onClick={() => {
              setSaving(false);
              setMessage("已重置预览。");
            }}
          >
            重置预览
          </GlassButton>
        </div>
      </section>
      <section aria-label="外观设置" {...stylex.props(s.settings)}>
        <div {...stylex.props(s.row)}>
          <div>
            <h2 {...stylex.props(s.label)}>状态反馈</h2>
            <p {...stylex.props(s.note)}>使用键盘空格切换，保留原生表单与焦点行为。</p>
          </div>
          <Switch aria-label="状态反馈" checked={enabled} onCheckedChange={setEnabled}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
      </section>
      <div {...stylex.props(s.states)}>
        <Button
          onClick={() => {
            setSaving(true);
            setMessage("正在演示加载状态，点击取消保存可恢复。");
          }}
          isLoading={saving}
        >
          保存预览
        </Button>
        <Button
          variant="borderless"
          disabled={!saving}
          onClick={() => {
            setSaving(false);
            setMessage("已取消保存。");
          }}
        >
          取消保存
        </Button>
        <GlassButton variant="default" disabled>
          不可用
        </GlassButton>
      </div>
      <output {...stylex.props(s.status)}>
        {message} 状态反馈{enabled ? "已开启" : "已关闭"}。
      </output>
    </main>
  );
}

const meta = {
  title: "Materials/Glass",
  component: Review,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Review>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MaterialReview: Story = {};
