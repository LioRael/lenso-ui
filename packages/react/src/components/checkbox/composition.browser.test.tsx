import { createRef, type ComponentPropsWithRef } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import { CheckboxRoot } from "./checkbox.js";
import { buttonTestStyles } from "../../../../styles/src/components/button/button.test-styles.js";

function CheckboxElement(props: ComponentPropsWithRef<"span">) {
  return <span {...props} />;
}

test("checkbox render composition preserves both refs, events, state styles and dynamic xstyle", async () => {
  const ref = createRef<HTMLSpanElement>();
  const renderRef = createRef<HTMLSpanElement>();
  const click = vi.fn();
  const renderedClick = vi.fn();
  const renderedKey = vi.fn();
  const changed = vi.fn();
  const screen = await render(
    <CheckboxRoot
      ref={ref}
      aria-label="Receive updates"
      data-slot="custom-checkbox"
      xstyle={buttonTestStyles.dynamic(123)}
      style={({ checked }) => (checked ? { paddingInlineStart: 17 } : undefined)}
      onClick={click}
      onCheckedChange={changed}
      render={<CheckboxElement ref={renderRef} onClick={renderedClick} onKeyDown={renderedKey} />}
    >
      Receive updates
    </CheckboxRoot>,
  );
  const checkbox = screen.getByRole("checkbox", { name: "Receive updates" });
  const element = checkbox.element();
  expect(ref.current).toBe(element);
  expect(renderRef.current).toBe(element);
  await expect.element(checkbox).toHaveAttribute("data-slot", "custom-checkbox");
  await expect.poll(() => getComputedStyle(element).width).toBe("123px");
  await expect.poll(() => getComputedStyle(element).backgroundColor).toBe("rgb(12, 34, 56)");
  await checkbox.click();
  await expect.element(checkbox).toHaveAttribute("aria-checked", "true");
  expect(click).toHaveBeenCalledOnce();
  expect(renderedClick).toHaveBeenCalledOnce();
  expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: "none" }));
  await expect.poll(() => getComputedStyle(element).paddingInlineStart).toBe("17px");
  await userEvent.keyboard(" ");
  await expect.element(checkbox).toHaveAttribute("aria-checked", "false");
  expect(renderedKey).toHaveBeenCalledOnce();
  await expect.poll(() => getComputedStyle(element).paddingInlineStart).toBe("0px");
  await expect.poll(() => getComputedStyle(element).width).toBe("123px");
});
