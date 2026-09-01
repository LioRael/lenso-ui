import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Button } from "../button/index.js";
import { ContentState } from "./index.js";

test("Content State composes content without imposing live-region semantics", async () => {
  const screen = await render(
    <>
      <ContentState.Root data-testid="static-state">
        <ContentState.Visual aria-hidden="true">○</ContentState.Visual>
        <ContentState.Title as="h2">No results</ContentState.Title>
        <ContentState.Description>Try changing the current filters.</ContentState.Description>
        <ContentState.Actions>
          <Button variant="secondary">Clear filters</Button>
        </ContentState.Actions>
      </ContentState.Root>
      <ContentState.Root
        align="start"
        aria-labelledby="loading-title"
        aria-live="polite"
        data-testid="dynamic-state"
        render={<output />}
      >
        <ContentState.Title as="h2" id="loading-title">
          Loading details
        </ContentState.Title>
      </ContentState.Root>
    </>,
  );

  const staticState = screen.getByTestId("static-state");
  const dynamicState = screen.getByTestId("dynamic-state");
  expect(staticState.element().tagName).toBe("DIV");
  expect(staticState.element().getAttribute("role")).toBeNull();
  expect(staticState.element().getAttribute("aria-live")).toBeNull();
  expect(dynamicState.element().tagName).toBe("OUTPUT");
  expect(dynamicState.element().getAttribute("role")).toBeNull();
  expect(dynamicState.element().getAttribute("data-align")).toBe("start");
  expect(screen.getByRole("heading", { level: 2, name: "No results" }).element().tagName).toBe(
    "H2",
  );
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
