/** HeroUI-derived color slider regression proof. Apache-2.0. */
import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { ColorSlider } from "./index.js";

afterEach(cleanup);

// The source vertical example collapsed to a zero-height track because optional
// label/output rows kept occupying the implicit grid. Exercise every composition.
it.each([
  { label: false, output: false },
  { label: true, output: false },
  { label: false, output: true },
  { label: true, output: true },
])("keeps a usable vertical track with label=$label output=$output", async ({ label, output }) => {
  const screen = await render(
    <div style={{ height: 192 }}>
      <ColorSlider
        aria-label="Hue"
        channel="hue"
        orientation="vertical"
        defaultValue="hsl(0, 100%, 50%)"
      >
        {label && <ColorSlider.Label>Hue</ColorSlider.Label>}
        {output && <ColorSlider.Output />}
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
    </div>,
  );
  const root = screen
    .getByRole("slider", { name: "Hue" })
    .element()
    .closest('[data-slot="color-slider"]');
  const track = root?.querySelector('[data-slot="color-slider-track"]');
  expect(track).toBeInstanceOf(HTMLElement);
  const box = track!.getBoundingClientRect();
  expect(box.width).toBe(20);
  expect(box.height).toBeGreaterThan(100);
  expect(box.height).toBeLessThanOrEqual(172);
});
