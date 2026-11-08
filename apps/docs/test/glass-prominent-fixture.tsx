import { createRoot } from "react-dom/client";
import { GlassButton, ThemeScope } from "@lenso/ui";
import { Basic } from "../src/demos/en/glass-button/basic";
import "../src/styles/global.css";
export function mount(host: HTMLElement, tint: number, theme: "light" | "dark" = "light") {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme} glassTint={tint}>
      <main
        style={{ padding: 40, background: theme === "light" ? "white" : "#141414", minHeight: 300 }}
      >
        <Basic />
        <div style={{ marginTop: 30, display: "flex", gap: 16 }}>
          <GlassButton variant="prominent" tint="#15a34a">
            Custom
          </GlassButton>
          <GlassButton variant="prominent" disabled>
            Disabled
          </GlassButton>
        </div>
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
