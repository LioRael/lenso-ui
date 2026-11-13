import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { PopoverBasic } from "../src/demos/stories/popover";
import { DevStyleX } from "../src/components/dev-stylex";
import { ScrollableExampleScene } from "../src/components/component-example-frame";
import { panel } from "../src/stories/story-panel.stylex";
import { tracePopupPlacement } from "./popup-live-placement";
import "../src/styles/global.css";

// The centered docs preview supplies the containing block that exposed the
// Safari first-frame offset; a plain popup in document flow did not reproduce it.
export function mount(host: HTMLElement) {
  const root = createRoot(host);
  const stop = tracePopupPlacement();
  root.render(
    <ThemeScope theme="light">
      <DevStyleX />
      <main style={{ padding: 40, paddingLeft: 200, minHeight: "100vh" }}>
        <h1>Popover initial placement</h1>
        <div style={{ width: 760, maxWidth: "100%", marginTop: 120 }}>
          <ScrollableExampleScene {...stylex.props(panel.scene)}>
            <div {...stylex.props(panel.previewContent)}>
              <PopoverBasic side="bottom" align="center" arrow />
            </div>
          </ScrollableExampleScene>
        </div>
      </main>
    </ThemeScope>,
  );
  return () => {
    stop();
    root.unmount();
  };
}
