import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Button } from "../button/index.js";
import { InlineAlert } from "./index.js";

test("Inline Alert communicates tone without assuming announcement urgency", async () => {
  const screen = await render(
    <>
      <InlineAlert.Root data-testid="notice" tone="warning">
        <InlineAlert.Icon />
        <InlineAlert.Content>
          <InlineAlert.Title as="h2">Configuration changed</InlineAlert.Title>
          <InlineAlert.Description>
            Review the new values before continuing.
          </InlineAlert.Description>
        </InlineAlert.Content>
        <InlineAlert.Actions>
          <Button variant="secondary">Review</Button>
        </InlineAlert.Actions>
      </InlineAlert.Root>
      <InlineAlert.Root aria-live="assertive" role="alert" tone="error">
        <InlineAlert.Icon />
        <InlineAlert.Content>
          <InlineAlert.Title as="h2">Unable to save</InlineAlert.Title>
        </InlineAlert.Content>
      </InlineAlert.Root>
    </>,
  );

  const notice = screen.getByTestId("notice");
  expect(notice.element().getAttribute("role")).toBeNull();
  expect(notice.element().getAttribute("aria-live")).toBeNull();
  expect(notice.element().querySelector('[data-slot="inline-alert-icon"] svg')).not.toBeNull();
  expect(
    screen.getByRole("heading", { level: 2, name: "Configuration changed" }).element().tagName,
  ).toBe("H2");
  await expect
    .poll(() => getComputedStyle(notice.element()).borderLeftColor)
    .toBe("rgb(138, 90, 0)");
  expect(screen.getByRole("alert").element().getAttribute("data-tone")).toBe("error");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
