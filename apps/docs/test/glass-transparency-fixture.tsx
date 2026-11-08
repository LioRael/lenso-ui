import { createRoot } from "react-dom/client";
import type { ComponentType, HTMLAttributes, CSSProperties } from "react";
import { Glass, ThemeScope } from "@lenso/ui";
import "../src/styles/global.css";

const scene =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240"><path fill="%23e63559" d="M0 0h120v240H0z"/><path fill="%23245fe6" d="M120 0h120v240H120z"/><path fill="%23c8c8c8" d="M240 0h120v240H240z"/><path stroke="%23000" stroke-width="2" d="M0 120h360M60 0v240M180 0v240M300 0v240"/></svg>';

export function mount(
  host: HTMLElement,
  Reference: ComponentType<HTMLAttributes<HTMLDivElement>>,
  theme: "light" | "dark",
  opacity?: number,
) {
  const root = createRoot(host);
  const update = (value: number, fresh = true) =>
    root.render(
      <ThemeScope theme={theme}>
        <main
          style={{
            display: "flex",
            gap: 24,
            padding: 24,
            background: theme === "dark" ? "#141414" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          {["reference", "transparency", "appearance"].map((kind) => {
            const Component = kind === "reference" ? Reference : Glass;
            const options =
              kind === "transparency"
                ? { glassTransparency: value }
                : kind === "appearance"
                  ? { glassTint: 1 - value, glassTransparency: opacity }
                  : {};
            return (
              <ThemeScope
                key={`${kind}-${fresh ? value : "live"}`}
                {...options}
                style={{ "--lg-transparency": value } as CSSProperties}
              >
                <div style={{ marginBottom: 12, fontSize: 14 }}>
                  {kind === "reference"
                    ? `Reference transparency = ${value}`
                    : kind === "appearance"
                      ? `Lenso glassTint = ${1 - value}`
                      : `Lenso glassTransparency = ${value}`}
                </div>
                <section
                  data-transparency-case={kind}
                  style={{ position: "relative", width: 360, height: 240 }}
                >
                  <img
                    alt=""
                    data-lenso-backdrop=""
                    data-liquidglass-backdrop=""
                    src={scene}
                    style={{ position: "absolute", inset: 0, width: 360, height: 240 }}
                  />
                  <Component
                    data-audit-glass=""
                    style={{
                      position: "absolute",
                      left: 20,
                      top: 50,
                      width: 320,
                      height: 140,
                      borderRadius: 20,
                    }}
                  />
                </section>
              </ThemeScope>
            );
          })}
        </main>
      </ThemeScope>,
    );
  return { update, destroy: () => root.unmount() };
}

// The CSS-copy reference keeps WebKit's source filtering separate from its clip.
export function ClearReference({ style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} style={{ ...style, overflow: "hidden" }}>
      <img
        alt=""
        src={scene}
        style={{
          position: "absolute",
          left: -20,
          top: -50,
          width: 360,
          height: 240,
          maxWidth: "none",
          filter: "blur(1.3px) contrast(.793) brightness(1.205) saturate(1.117)",
        }}
      />
    </div>
  );
}
