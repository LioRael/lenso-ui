import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import {
  SliderRoot,
  SliderLabel,
  SliderOutput,
  SliderControl,
  SliderTrack,
  SliderFill,
  SliderThumb,
} from "./slider.js";
import { buttonTestStyles } from "../../../../styles/src/components/button/button.test-styles.js";

test("slider concrete parts retain native state callbacks, refs and keyboard value changes", async () => {
  const ref = createRef<HTMLDivElement>();
  const renderRef = createRef<HTMLDivElement>();
  const thumbRef = createRef<HTMLDivElement>();
  const changed = vi.fn();
  const screen = await render(
    <SliderRoot
      ref={ref}
      defaultValue={30}
      onValueChange={changed}
      data-slot={null}
      xstyle={buttonTestStyles.dynamic(213)}
      style={({ disabled }) => (disabled ? { opacity: 0.5 } : undefined)}
      render={<div ref={renderRef} />}
    >
      <SliderLabel>Volume</SliderLabel>
      <SliderOutput />
      <SliderControl>
        <SliderTrack>
          <SliderFill />
          <SliderThumb
            ref={thumbRef}
            aria-label="Volume"
            xstyle={buttonTestStyles.dynamic(31)}
            style={({ dragging }) => (dragging ? { opacity: 0.7 } : undefined)}
          />
        </SliderTrack>
      </SliderControl>
    </SliderRoot>,
  );
  expect(ref.current).toBe(renderRef.current);
  expect(ref.current?.dataset["slot"]).toBe("slider");
  await expect.poll(() => ref.current && getComputedStyle(ref.current).width).toBe("213px");
  const thumb = screen.getByRole("slider", { name: "Volume" });
  expect(thumbRef.current?.contains(thumb.element())).toBe(true);
  await expect
    .poll(() => thumbRef.current && getComputedStyle(thumbRef.current).width)
    .toBe("31px");
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(thumb).toHaveAttribute("aria-valuenow", "31");
  expect(changed).toHaveBeenCalledWith(31, expect.objectContaining({ reason: "keyboard" }));
  await expect
    .poll(() => thumbRef.current && getComputedStyle(thumbRef.current).width)
    .toBe("31px");
});
