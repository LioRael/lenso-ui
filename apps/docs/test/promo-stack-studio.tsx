import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import { Default as Cascade } from "../src/demos/en/menu/default";
import { Default as Stacked } from "./promo-stack-default";
import "../src/styles/global.css";

export function mount(host: HTMLElement, stacked: boolean) {
  const Component = stacked ? Stacked : Cascade;
  const root = createRoot(host);
  root.render(
    <ThemeScope theme="light" glassTint={0.5}>
      <style>{`[data-promo-stack] [data-lenso-slot="menu-bar"], [data-promo-stack] output { display:none !important; }`}</style>
      <main
        data-promo-stack=""
        style={{
          position: "fixed",
          inset: 0,
          width: 1440,
          height: 900,
          background: "#f5f5f7",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 640, top: 300, width: 160 }}>
          <Component />
        </div>
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
