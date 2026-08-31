import * as React from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Slider } from "./index.js";

function ControlledSlider() {
  const [value, setValue] = React.useState(27);

  return (
    <div style={{ width: 200 }}>
      <output data-testid="slider-value">{value}</output>
      <Slider.Root
        max={100}
        min={0}
        onValueChange={(nextValue) =>
          setValue(Array.isArray(nextValue) ? nextValue[0]! : nextValue)
        }
        value={value}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Contrast" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}

test("Slider keeps stable geometry and native keyboard semantics", async () => {
  const screen = await render(<ControlledSlider />);
  const input = screen.getByRole("slider", { name: "Contrast" });
  const root = input.element().closest<HTMLElement>('[data-slot="slider"]')!;
  const control = root.querySelector<HTMLElement>('[data-slot="slider-control"]')!;
  const track = root.querySelector<HTMLElement>('[data-slot="slider-track"]')!;
  const thumb = root.querySelector<HTMLElement>('[data-slot="slider-thumb"]')!;

  await expect.poll(() => control.getBoundingClientRect().height).toBe(28);
  await expect.poll(() => track.getBoundingClientRect().height).toBe(2);
  await expect.poll(() => thumb.getBoundingClientRect().height).toBe(28);
  await expect.poll(() => thumb.getBoundingClientRect().width).toBe(28);
  await expect.poll(() => getComputedStyle(thumb, "::before").height).toBe("14px");
  await expect.poll(() => getComputedStyle(thumb, "::before").width).toBe("14px");

  input.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByTestId("slider-value").element().textContent).toBe("28");
  expect(input.element().matches(":focus-visible")).toBe(true);

  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("Slider exposes a disabled state without changing its geometry", async () => {
  const screen = await render(
    <div style={{ width: 200 }}>
      <Slider.Root defaultValue={50} disabled>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Disabled contrast" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>,
  );
  const input = screen.getByRole("slider", { name: "Disabled contrast" });
  const root = input.element().closest<HTMLElement>('[data-slot="slider"]')!;
  const thumb = root.querySelector<HTMLElement>('[data-slot="slider-thumb"]')!;

  expect(input.element().hasAttribute("disabled")).toBe(true);
  expect(root.getAttribute("data-disabled")).not.toBeNull();
  expect(thumb.getBoundingClientRect().width).toBe(28);
  expect(getComputedStyle(root).opacity).toBe("0.5");
});
