import { createRoot } from "react-dom/client";
import { Glass, GlassButton, ThemeScope } from "@lenso/ui";
import { Material } from "../../../packages/ui/dist/utils/materials/render.js";
import "../src/styles/global.css";

export function mount(host: HTMLElement, theme: "light" | "dark", tint: number, size = 120) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme} glassTint={tint}>
      <main style={{ position: "relative", width: 700, height: 400 }}>
        <img
          alt=""
          data-lenso-backdrop=""
          src={
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="400"><rect width="700" height="400" fill="%23b84380"/></svg>'
          }
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        {[Glass, GlassButton, Material].map((Component, i) => (
          <Component
            key={i}
            {...(i === 2 ? { variant: "glass-medium" as const } : {})}
            data-tinted-case={i}
            aria-label={`Material ${i}`}
            style={{
              position: "absolute",
              left: 40 + i * 200,
              top: 80,
              width: size,
              minWidth: size,
              height: size,
              minHeight: size,
              padding: 0,
              borderRadius: size / 2,
            }}
          />
        ))}
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
