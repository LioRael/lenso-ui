import * as React from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import { Button } from "../components/button/button.js";
import { Card } from "../components/card/card.js";
import { Link } from "../components/link/link.js";
import { buttonTestStyles } from "../../../styles/src/components/button/button.test-styles.js";

test("native state changes preserve dynamic styles, render-element refs and consumer slots", async () => {
  const componentRef = React.createRef<HTMLButtonElement>();
  const renderedRef = React.createRef<HTMLButtonElement>();
  const renderedClick = vi.fn();
  const nativeClick = vi.fn();
  const stateStyle = vi.fn(({ disabled }: { disabled: boolean }) =>
    disabled ? { paddingInline: 9 } : undefined,
  );
  const screen = await render(
    <Button
      ref={componentRef}
      data-slot="consumer-action"
      xstyle={buttonTestStyles.dynamic(123)}
      style={stateStyle}
      onClick={nativeClick}
      render={
        <button ref={renderedRef} onClick={renderedClick}>
          Save changes
        </button>
      }
    >
      Save changes
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Save changes" });
  expect(componentRef.current).toBe(button.element());
  expect(renderedRef.current).toBe(button.element());
  await expect.element(button).toHaveAttribute("data-slot", "consumer-action");
  await expect.poll(() => getComputedStyle(button.element()).width).toBe("123px");
  await button.click();
  expect(nativeClick).toHaveBeenCalledTimes(1);
  expect(renderedClick).toHaveBeenCalledTimes(1);
  expect(stateStyle).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));

  await screen.rerender(
    <Button
      disabled
      ref={componentRef}
      data-slot="consumer-action"
      xstyle={buttonTestStyles.dynamic(123)}
      style={stateStyle}
      onClick={nativeClick}
      render={
        <button ref={renderedRef} onClick={renderedClick}>
          Save changes
        </button>
      }
    >
      Save changes
    </Button>,
  );
  await expect.element(button).toBeDisabled();
  expect(componentRef.current).toBe(button.element());
  expect(renderedRef.current).toBe(button.element());
  await expect.poll(() => getComputedStyle(button.element()).paddingInlineStart).toBe("9px");
  expect(getComputedStyle(button.element()).width).toBe("123px");
  expect(stateStyle).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  (button.element() as HTMLButtonElement).click();
  expect(nativeClick).toHaveBeenCalledTimes(1);
  expect(renderedClick).toHaveBeenCalledTimes(1);
});

test("native HTML and useRender composition retain refs, consumer styles and event ordering", async () => {
  const cardRef = React.createRef<HTMLDivElement>();
  const linkRef = React.createRef<HTMLAnchorElement>();
  const renderedRef = React.createRef<HTMLAnchorElement>();
  const calls: string[] = [];
  const screen = await render(
    <Card
      ref={cardRef}
      data-slot="consumer-card"
      xstyle={buttonTestStyles.dynamic(123)}
      style={{ width: 137 }}
    >
      <Link
        ref={linkRef}
        href="#composition"
        data-slot="consumer-link"
        onClick={(event) => {
          event.preventDefault();
          calls.push("component");
        }}
        render={
          <a
            ref={renderedRef}
            href="#composition"
            onClick={() => {
              calls.push("render");
            }}
          >
            Read changes
          </a>
        }
      >
        Read changes
      </Link>
    </Card>,
  );
  expect(cardRef.current?.dataset["slot"]).toBe("consumer-card");
  await expect.poll(() => getComputedStyle(cardRef.current!).width).toBe("137px");
  const link = screen.getByRole("link", { name: "Read changes" });
  expect(linkRef.current).toBe(link.element());
  expect(renderedRef.current).toBe(link.element());
  await expect.element(link).toHaveAttribute("data-slot", "consumer-link");
  await link.click();
  expect(calls).toEqual(["render", "component"]);
});
