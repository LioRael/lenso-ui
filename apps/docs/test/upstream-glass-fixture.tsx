import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, GlassButton, GlassToggleButton, Sheet, Slider, ThemeScope } from "@lenso/ui";
import { TabBarExample } from "../src/demos/en/tab-bar/basic";
import { Sizes } from "../src/demos/en/glass-button/sizes";
import "../src/styles/global.css";

function Fixture() {
  const [snap, setSnap] = useState<number | string | null>(0.525);
  const [clicks, setClicks] = useState(0);
  return (
    <main
      style={{
        padding: 24,
        minHeight: "100dvh",
        background: "var(--lenso-background-grouped-primary)",
      }}
    >
      <TabBarExample showSearch={false} />
      <div style={{ display: "flex", gap: 16, paddingBlock: 32 }}>
        <GlassButton elastic={false} onClick={() => setClicks(clicks + 1)}>
          Stationary glass
        </GlassButton>
        <GlassButton disabled>Disabled glass</GlassButton>
      </div>
      <output aria-label="Actions">{clicks}</output>
      <Sheet snapPoint={snap} onSnapPointChange={setSnap}>
        <Sheet.Trigger render={<Button />}>Open comparison sheet</Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Backdrop />
          <Sheet.Viewport>
            <Sheet.Popup>
              <Sheet.Handle />
              <Sheet.Header>
                <Sheet.Title>Comparison sheet</Sheet.Title>
                <Button onClick={() => setSnap(snap === 1 ? 0.525 : 1)}>Toggle detent</Button>
              </Sheet.Header>
              <Sheet.Body>
                <Sheet.Description>
                  Drag the body, scroll the notes, or edit the controls.
                </Sheet.Description>
                <input aria-label="Sheet text" defaultValue="Editable text" />
                <Slider defaultValue={30}>
                  <Slider.Label>Sheet range</Slider.Label>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Fill />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider.Control>
                </Slider>
                <div
                  data-case="horizontal"
                  style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBlock: 24 }}
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <span key={index} style={{ display: "inline-block", width: 100 }}>
                      Item {index + 1}
                    </span>
                  ))}
                </div>
                {Array.from({ length: 40 }, (_, index) => (
                  <p key={index}>Note {index + 1}</p>
                ))}
              </Sheet.Body>
              <Sheet.Footer>
                <Sheet.Close render={<Button />}>Done</Sheet.Close>
              </Sheet.Footer>
            </Sheet.Popup>
          </Sheet.Viewport>
        </Sheet.Portal>
      </Sheet>
    </main>
  );
}

export function mount(
  host: HTMLElement,
  theme: "light" | "dark",
  direction: "ltr" | "rtl" = "ltr",
) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme={theme} dir={direction}>
      <Fixture />
    </ThemeScope>,
  );
  return () => root.unmount();
}

export function mountElastic(host: HTMLElement) {
  const root = createRoot(host);
  root.render(
    <ThemeScope theme="light">
      <main style={{ padding: 32, display: "grid", gap: 32 }}>
        <Sizes />
        <GlassToggleButton>Save</GlassToggleButton>
      </main>
    </ThemeScope>,
  );
  return () => root.unmount();
}
