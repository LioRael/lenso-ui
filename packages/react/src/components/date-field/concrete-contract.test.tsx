import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { CalendarDate } from "@internationalized/date";
import { parseColor } from "react-aria-components/ColorArea";
import "virtual:stylex:runtime";
import { DateField } from "./index.js";
import { ColorField } from "../color-field/index.js";

const styles = stylex.create({
  width: (width: number) => ({ width }),
});

// Segment editing coverage did not prove that removing the shared factory kept
// supporting DOM render composition, native refs and runtime StyleX variables.
test("date supporting parts retain composed DOM refs, variable styles and label association", async () => {
  const labelRef = React.createRef<HTMLLabelElement>();
  const screen = await render(
    <DateField defaultValue={new CalendarDate(2026, 3, 14)}>
      <DateField.Label
        ref={labelRef}
        data-slot={null}
        xstyle={styles.width(123)}
        style={{ paddingInlineStart: 7 }}
        render={(props) => <span {...props} data-composed="date-label" />}
      >
        Departure
      </DateField.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>,
  );
  const label = screen.getByText("Departure").element();
  expect(labelRef.current).toBe(label);
  expect(label.getAttribute("data-slot")).toBe("label");
  expect(label.getAttribute("data-composed")).toBe("date-label");
  await expect.poll(() => getComputedStyle(label).width).toBe("123px");
  expect(getComputedStyle(label).paddingInlineStart).toBe("7px");
  const day = screen.getByRole("spinbutton", { name: /day/i });
  expect(day.element().getAttribute("aria-labelledby")).toContain(label.id);
  await day.click();
  await userEvent.keyboard("{ArrowUp}");
  await expect.element(day).toHaveAttribute("aria-valuenow", "15");
});

test("color state style callbacks preserve variables and native render/ref changes", async () => {
  const ref = React.createRef<HTMLDivElement>();
  const style = vi.fn(({ isInvalid }: { isInvalid: boolean }) =>
    isInvalid ? { paddingInlineStart: 9 } : undefined,
  );
  function Fixture({ invalid = false }: { invalid?: boolean }) {
    return (
      <ColorField
        ref={ref}
        defaultValue={parseColor("#f00")}
        isInvalid={invalid}
        data-slot="consumer-color"
        xstyle={styles.width(237)}
        style={style}
        render={(props, state) => <div {...props} data-render-invalid={state.isInvalid} />}
      >
        <ColorField.Label>Accent color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
    );
  }
  const screen = await render(<Fixture />);
  const root = ref.current!;
  expect(root.getAttribute("data-slot")).toBe("consumer-color");
  expect(root.getAttribute("data-render-invalid")).toBe("false");
  await expect.poll(() => getComputedStyle(root).width).toBe("237px");
  expect(style).toHaveBeenCalledWith(expect.objectContaining({ isInvalid: false }));
  await screen.rerender(<Fixture invalid />);
  expect(ref.current).toBe(root);
  expect(root.getAttribute("data-render-invalid")).toBe("true");
  expect(style).toHaveBeenCalledWith(expect.objectContaining({ isInvalid: true }));
  expect(getComputedStyle(root).paddingInlineStart).toBe("9px");
  expect(getComputedStyle(root).width).toBe("237px");
});
