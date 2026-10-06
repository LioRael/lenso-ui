import * as React from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Button } from "./button.js";
import { ButtonGroup } from "../button-group/button-group.js";
import { CloseButton } from "../close-button/close-button.js";
import { ToggleButton } from "../toggle-button/toggle-button.js";
import { ToggleButtonGroup } from "../toggle-button-group/toggle-button-group.js";
import { Toolbar } from "../toolbar/toolbar.js";
import { buttonTestStyles as overrides } from "../../../../styles/src/components/button/button.test-styles.js";

test("loading blocks native submission and render capture without replacing focus or name", async () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const action = vi.fn();
  const capture = vi.fn();
  const keyboard = vi.fn();
  const ref = React.createRef<HTMLButtonElement>();
  function Fixture() {
    const [loading, setLoading] = React.useState(false);
    return (
      <form onSubmit={submit}>
        <Button
          ref={ref}
          isLoading={loading}
          type="submit"
          onClick={() => {
            action();
            setLoading(true);
          }}
          render={
            <button
              aria-label="Publish"
              onClickCapture={capture}
              onKeyDownCapture={keyboard}
              onKeyUpCapture={keyboard}
            />
          }
        >
          Publish
        </Button>
      </form>
    );
  }
  const screen = await render(<Fixture />);
  const button = screen.getByRole("button", { name: "Publish" });
  await button.click();
  await expect.element(button).toHaveAttribute("aria-busy", "true");
  expect(ref.current).toBe(button.element());
  expect(document.activeElement).toBe(button.element());
  action.mockClear();
  capture.mockClear();
  keyboard.mockClear();
  submit.mockClear();
  (button.element() as HTMLButtonElement).click();
  await userEvent.keyboard("{Enter} ");
  button
    .element()
    .dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  button
    .element()
    .dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }));
  expect(action).not.toHaveBeenCalled();
  expect(capture).not.toHaveBeenCalled();
  expect(keyboard).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
  await expect.element(button).toHaveAccessibleName("Publish");
  expect(document.activeElement).toBe(button.element());
  expect((button.element() as HTMLButtonElement).disabled).toBe(false);
});

test("loading also guards handlers returned by a render callback", async () => {
  const capture = vi.fn();
  const screen = await render(
    <Button
      isLoading
      render={(props) => (
        <button {...props} onClickCapture={capture} onKeyDownCapture={capture}>
          Save
        </button>
      )}
    />,
  );
  const button = screen.getByRole("button", { name: "Save" });
  (button.element() as HTMLButtonElement).focus();
  (button.element() as HTMLButtonElement).click();
  await userEvent.keyboard("{Enter} ");
  expect(capture).not.toHaveBeenCalled();
});

test("dynamic xstyle and Base state styles coexist; explicit icons keep control geometry", async () => {
  const screen = await render(
    <>
      <Button
        xstyle={overrides.dynamic(123)}
        style={({ disabled }) => ({ paddingInline: disabled ? 0 : 7 })}
      >
        <Button.Icon>
          <svg viewBox="0 0 16 16">
            <path d="M8 2v12" />
          </svg>
        </Button.Icon>
        Override
      </Button>
      <Button size="sm" isIconOnly aria-label="Icon action">
        <Button.Icon>
          <svg viewBox="0 0 16 16">
            <path d="M8 2v12" />
          </svg>
        </Button.Icon>
      </Button>
      <CloseButton />
    </>,
  );
  const button = screen.getByRole("button", { name: "Override" }).element();
  await expect.poll(() => getComputedStyle(button).width).toBe("123px");
  await expect.poll(() => getComputedStyle(button).backgroundColor).toBe("rgb(12, 34, 56)");
  expect(getComputedStyle(button).paddingInlineStart).toBe("7px");
  expect(button.querySelector("svg")?.getBoundingClientRect().width).toBe(16);
  const close = screen.getByRole("button", { name: "Close" }).element();
  expect(close.getBoundingClientRect().width).toBe(24);
  expect(close.getBoundingClientRect().height).toBe(24);
  const iconOnly = screen.getByRole("button", { name: "Icon action" }).element();
  expect(iconOnly.getBoundingClientRect().width).toBe(32);
  expect(getComputedStyle(iconOnly).paddingInlineStart).toBe("0px");
  await page.viewport(390, 844);
  try {
    expect(button.getBoundingClientRect().height).toBe(40);
    expect(button.querySelector("svg")?.getBoundingClientRect().width).toBe(20);
    expect(iconOnly.getBoundingClientRect().width).toBe(36);
    expect(close.getBoundingClientRect().width).toBe(24);
  } finally {
    await page.viewport(1280, 900);
  }
});

test("source token references resolve in their local theme rather than to missing hashed variables", async () => {
  const screen = await render(
    <>
      <div data-theme="light">
        <Button variant="secondary">Light action</Button>
        <span
          data-testid="light-probe"
          style={{
            backgroundColor: "var(--default)",
            color: "var(--accent-soft-foreground)",
            borderRadius: "var(--radius-3xl)",
          }}
        />
      </div>
      <div data-theme="dark">
        <Button variant="secondary">Dark action</Button>
        <span
          data-testid="dark-probe"
          style={{
            backgroundColor: "var(--default)",
            color: "var(--accent-soft-foreground)",
            borderRadius: "var(--radius-3xl)",
          }}
        />
      </div>
    </>,
  );
  for (const theme of ["light", "dark"] as const) {
    const button = screen.getByRole("button", {
      name: theme === "light" ? "Light action" : "Dark action",
    });
    // A retained pointer can activate the hover token instead of the default token.
    await button.hover();
    await button.unhover();
    const element = button.element();
    const reference = getComputedStyle(screen.getByTestId(`${theme}-probe`).element());
    await expect
      .poll(() => getComputedStyle(element).backgroundColor)
      .toBe(reference.backgroundColor);
    await expect.poll(() => getComputedStyle(element).color).toBe(reference.color);
    await expect
      .poll(() => getComputedStyle(element).borderTopLeftRadius)
      .toBe(reference.borderTopLeftRadius);
    expect(getComputedStyle(element).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  }
});

test("attached buttons round logical outer edges and leave the keyboard focus ring above neighbors", async () => {
  const screen = await render(
    <ButtonGroup dir="rtl" aria-label="Actions" variant="outline">
      <Button>First</Button>
      <Button>Last</Button>
    </ButtonGroup>,
  );
  const first = screen.getByRole("button", { name: "First" }).element();
  const last = screen.getByRole("button", { name: "Last" }).element();
  expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
  expect(getComputedStyle(first).borderTopRightRadius).not.toBe("0px");
  expect(getComputedStyle(first).borderTopLeftRadius).toBe("0px");
  expect(getComputedStyle(last).borderTopLeftRadius).not.toBe("0px");
  await userEvent.tab();
  expect(document.activeElement).toBe(first);
  expect(getComputedStyle(first).zIndex).toBe("10");
  expect(getComputedStyle(first).boxShadow).not.toBe("none");
});

test("toggle selection and toolbar roving focus use native Base UI keyboard behavior", async () => {
  const screen = await render(
    <>
      <ToggleButtonGroup aria-label="Text style" defaultValue={["bold"]}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
      </ToggleButtonGroup>
      <Toolbar aria-label="Editor">
        <Toolbar.Button>Undo</Toolbar.Button>
        <Toolbar.Button>Redo</Toolbar.Button>
      </Toolbar>
    </>,
  );
  const bold = screen.getByRole("button", { name: "Bold" });
  const italic = screen.getByRole("button", { name: "Italic" });
  await expect.element(bold).toHaveAttribute("aria-pressed", "true");
  await userEvent.tab();
  expect(document.activeElement).toBe(bold.element());
  await userEvent.keyboard("{ArrowRight} ");
  expect(document.activeElement).toBe(italic.element());
  await expect.element(italic).toHaveAttribute("aria-pressed", "true");
  await expect.element(bold).toHaveAttribute("aria-pressed", "false");
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }).element());
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Redo" }).element());
});
