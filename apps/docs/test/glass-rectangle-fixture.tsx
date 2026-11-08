import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import { GlassPreferences } from "../src/demos/shared/glass-preferences";
import { Default } from "../src/demos/cn/menu/default";
import "../src/styles/global.css";
export function mount(
  host: HTMLElement,
  tint: number,
  theme: "light" | "dark" = "light",
  opacity?: number,
) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme} glassTint={tint} glassTransparency={opacity}>
      <main style={{ padding: 32, position: "relative", isolation: "isolate" }}>
        <img
          alt=""
          data-lenso-backdrop=""
          src={
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="900"><rect width="1000" height="900" fill="%23e5e9ef"/></svg>'
          }
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: -1 }}
        />
        <GlassPreferences locale="cn" />
        <div style={{ marginTop: 48 }}>
          <Default />
        </div>
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}

export { readOptics, createOpticsBatch } from "../../../packages/glass/src/gpu-optics";
