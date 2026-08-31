import * as React from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { SearchIcon } from "lucide-react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { TextField } from "./index.js";

function SearchField() {
  const [query, setQuery] = React.useState("runtime");

  return (
    <TextField.Root size="compact">
      <TextField.Label>Search plugins</TextField.Label>
      <TextField.InputGroup data-testid="search-input-group">
        <TextField.Leading>
          <SearchIcon aria-hidden="true" size={14} />
        </TextField.Leading>
        <TextField.Control
          onValueChange={setQuery}
          placeholder="Search…"
          type="search"
          value={query}
        />
        <TextField.Trailing>
          <TextField.Clear onClear={() => setQuery("")} />
        </TextField.Trailing>
      </TextField.InputGroup>
    </TextField.Root>
  );
}

test("Text Field composes an accessible compact search input", async () => {
  const screen = await render(<SearchField />);
  const input = screen.getByRole("searchbox", { name: "Search plugins" });
  const clear = screen.getByRole("button", { name: "Clear input" });
  const group = screen.getByTestId("search-input-group");
  const leading = group.element().querySelector<HTMLElement>('[data-slot="text-field-leading"]');

  expect((input.element() as HTMLInputElement).value).toBe("runtime");
  await expect.poll(() => group.element().getBoundingClientRect().height).toBe(28);
  await expect.poll(() => clear.element().getBoundingClientRect().height).toBe(24);
  await expect.poll(() => clear.element().getBoundingClientRect().width).toBe(24);
  expect(leading?.hasAttribute("aria-hidden")).toBe(false);
  expect(leading?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  expect(getComputedStyle(input.element()).borderStyle).toBe("none");

  await userEvent.click(input);
  await expect.poll(() => getComputedStyle(group.element()).outlineColor).toBe("rgb(94, 106, 210)");

  await userEvent.click(clear);
  expect((input.element() as HTMLInputElement).value).toBe("");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("Text Field keeps standalone geometry and supports grouped trailing content", async () => {
  const screen = await render(
    <div>
      <TextField.Root>
        <TextField.Label>Project name</TextField.Label>
        <TextField.Control data-testid="default-control" placeholder="Untitled" />
      </TextField.Root>
      <TextField.Root size="compact">
        <TextField.Label>Filter commands</TextField.Label>
        <TextField.InputGroup data-testid="filter-input-group">
          <TextField.Control placeholder="Filter…" />
          <TextField.Trailing aria-hidden="true">⌘K</TextField.Trailing>
        </TextField.InputGroup>
      </TextField.Root>
    </div>,
  );

  expect(screen.getByTestId("default-control").element().getBoundingClientRect().height).toBe(32);
  await expect
    .poll(() => screen.getByTestId("filter-input-group").element().getBoundingClientRect().height)
    .toBe(28);
  expect(screen.getByText("⌘K").element().getAttribute("aria-hidden")).toBe("true");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
