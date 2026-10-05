import * as React from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import { InputGroup } from "@lenso/ui";

// Adornment tests name their controls explicitly; they do not prove the loading demo is named.
test("loading suffix demo names the native input and keeps it keyboard editable", async () => {
  const { WithLoadingSuffix } =
    await import("../../../../../apps/docs/src/demos/en/input-group/with-loading-suffix");
  const screen = await render(<WithLoadingSuffix />);
  const input = screen.getByRole("textbox", { name: "Status" });
  await expect.element(input).toHaveAccessibleName("Status");
  await input.fill("Ready");
  await expect.element(input).toHaveValue("Ready");
  expect(document.activeElement).toBe(input.element());
});

// Existing form workflows exercise entry and submission, not clicks on adornments.
test.each(["prefix", "suffix"] as const)("%s text and SVG focus the native input", async (side) => {
  const Adornment = side === "prefix" ? InputGroup.Prefix : InputGroup.Suffix;
  const screen = await render(
    <InputGroup>
      <Adornment>
        <span>Currency</span>
        <svg data-testid="currency-icon" width="20" height="20">
          <circle cx="10" cy="10" r="8" />
        </svg>
      </Adornment>
      <InputGroup.Input aria-label="Amount" />
    </InputGroup>,
  );
  const input = screen.getByRole("textbox").element();
  await screen.getByText("Currency", { exact: true }).click();
  expect(document.activeElement).toBe(input);
  (input as HTMLInputElement).blur();
  await screen.getByTestId("currency-icon").click();
  expect(document.activeElement).toBe(input);
});

test("textarea adornment and root space focus the actual textarea and preserve root props/ref", async () => {
  const ref = React.createRef<HTMLDivElement>();
  const clicked = vi.fn();
  const screen = await render(
    <InputGroup ref={ref} tabIndex={-1} title="Group" onClick={clicked}>
      <InputGroup.Prefix>Notes</InputGroup.Prefix>
      <InputGroup.TextArea aria-label="Notes" />
    </InputGroup>,
  );
  await screen.getByText("Notes", { exact: true }).click();
  expect(document.activeElement).toBe(screen.getByRole("textbox").element());
  (screen.getByRole("textbox").element() as HTMLTextAreaElement).blur();
  ref.current?.click();
  expect(document.activeElement).toBe(screen.getByRole("textbox").element());
  expect(ref.current?.title).toBe("Group");
  expect(clicked).toHaveBeenCalledTimes(2);
});

test("native input render preserves direct refs and composed control handlers", async () => {
  const controlRef = React.createRef<HTMLInputElement>();
  const renderRef = React.createRef<HTMLInputElement>();
  const controlClick = vi.fn();
  const renderClick = vi.fn();
  const screen = await render(
    <InputGroup>
      <InputGroup.Prefix>Rendered</InputGroup.Prefix>
      <InputGroup.Input
        ref={controlRef}
        aria-label="Rendered value"
        onClick={controlClick}
        render={<input ref={renderRef} onClick={renderClick} />}
      />
    </InputGroup>,
  );
  await screen.getByText("Rendered", { exact: true }).click();
  expect(document.activeElement).toBe(controlRef.current);
  expect(renderRef.current).toBe(controlRef.current);
  await screen.getByRole("textbox").click();
  expect(controlClick).toHaveBeenCalledTimes(1);
  expect(renderClick).toHaveBeenCalledTimes(1);
});

test("suffix button SVG, link and custom focusable control retain their action and focus", async () => {
  const action = vi.fn();
  const screen = await render(
    <InputGroup>
      <InputGroup.Input aria-label="Value" />
      <InputGroup.Suffix>
        <button onClick={action} type="button" aria-label="Clear">
          <svg data-testid="clear-icon" width="20" height="20">
            <circle cx="10" cy="10" r="8" />
          </svg>
        </button>
        <a href="#input-group-test" onClick={(event) => event.preventDefault()}>
          Help
        </a>
        {/* Intentionally exercises a custom control rather than another native button. */}
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <span role="button" tabIndex={0} onClick={action} onKeyDown={action}>
          Custom
        </span>
      </InputGroup.Suffix>
    </InputGroup>,
  );
  await screen.getByTestId("clear-icon").click();
  expect(document.activeElement).toBe(screen.getByRole("button").first().element());
  await screen.getByRole("link").click();
  expect(document.activeElement).toBe(screen.getByRole("link").element());
  await screen.getByText("Custom").click();
  expect(document.activeElement).toBe(screen.getByText("Custom").element());
  expect(action).toHaveBeenCalledTimes(2);
});

test.each(["root", "descendant"] as const)(
  "%s cancellation prevents adornment focus",
  async (at) => {
    const screen = await render(
      <InputGroup onClick={at === "root" ? (event) => event.preventDefault() : undefined}>
        <InputGroup.Prefix
          onClick={at === "descendant" ? (event) => event.preventDefault() : undefined}
        >
          Cancel
        </InputGroup.Prefix>
        <InputGroup.Input aria-label="Value" />
      </InputGroup>,
    );
    await screen.getByText("Cancel").click();
    expect(document.activeElement).not.toBe(screen.getByRole("textbox").element());
  },
);

test.each(["input", "textarea"] as const)("disabled %s is not focused", async (kind) => {
  const Control = kind === "input" ? InputGroup.Input : InputGroup.TextArea;
  const screen = await render(
    <fieldset disabled>
      <InputGroup>
        <InputGroup.Prefix>Disabled</InputGroup.Prefix>
        <Control aria-label="Disabled control" />
      </InputGroup>
    </fieldset>,
  );
  await screen.getByText("Disabled", { exact: true }).click();
  expect(document.activeElement).not.toBe(screen.getByRole("textbox").element());
});
