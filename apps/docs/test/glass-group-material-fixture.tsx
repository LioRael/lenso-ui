import { createRoot } from "react-dom/client";
import { ButtonGroup, GlassButton, ThemeScope } from "@lenso/ui";
import "../src/styles/global.css";
import { DevStyleX } from "../src/components/dev-stylex";

export function mount(host: HTMLElement, theme: "light" | "dark" = "light") {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme}>
      <DevStyleX />
      <main
        style={{
          padding: 32,
          display: "grid",
          gap: 28,
          background: theme === "light" ? "#f1f1f5" : "#242428",
        }}
      >
        <h1>Glass material comparison</h1>
        {[false, true].map((pattern) => (
          <section
            key={String(pattern)}
            style={{
              position: "relative",
              isolation: "isolate",
              padding: 24,
              display: "grid",
              gap: 24,
            }}
          >
            {pattern && (
              <img
                alt=""
                data-lenso-backdrop=""
                src={
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="400"><rect width="900" height="400" fill="%23e4e8ec"/><path d="M0 300L900 0" stroke="%233a99c9" stroke-width="130"/><path d="M100 0L500 400" stroke="%23eab080" stroke-width="90"/></svg>'
                }
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: -1,
                }}
              />
            )}
            <GlassButton size="md" elastic={false} style={{ justifySelf: "start" }}>
              Standalone
            </GlassButton>
            <ButtonGroup size="md" aria-label={pattern ? "Pattern group" : "Neutral group"}>
              <GlassButton elastic={false}>First action</GlassButton>
              <GlassButton elastic={false}>Second action</GlassButton>
            </ButtonGroup>
          </section>
        ))}
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
