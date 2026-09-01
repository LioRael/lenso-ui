import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { DescriptionList } from "./index.js";

test("Description List preserves native terms and supports composed layouts", async () => {
  const screen = await render(
    <>
      <DescriptionList.Root data-testid="inline-list">
        <DescriptionList.Item>
          <DescriptionList.Term>Owner</DescriptionList.Term>
          <DescriptionList.Description>Interface team</DescriptionList.Description>
        </DescriptionList.Item>
        <DescriptionList.Item>
          <DescriptionList.Term>Region</DescriptionList.Term>
          <DescriptionList.Description>Asia Pacific</DescriptionList.Description>
        </DescriptionList.Item>
      </DescriptionList.Root>
      <DescriptionList.Root data-testid="stacked-list" layout="stacked">
        <DescriptionList.Item data-testid="stacked-item">
          <DescriptionList.Term>Summary</DescriptionList.Term>
          <DescriptionList.Description>
            Reusable product-neutral metadata.
          </DescriptionList.Description>
        </DescriptionList.Item>
      </DescriptionList.Root>
    </>,
  );

  const inline = screen.getByTestId("inline-list");
  const inlineItem = inline
    .element()
    .querySelector<HTMLElement>('[data-slot="description-list-item"]');
  const terms = inline.element().querySelectorAll("dt");
  const details = inline.element().querySelectorAll("dd");
  expect(inline.element().tagName).toBe("DL");
  expect(terms).toHaveLength(2);
  expect(details).toHaveLength(2);
  expect(inlineItem).not.toBeNull();
  await expect.poll(() => getComputedStyle(inlineItem!).gridTemplateColumns).not.toBe("none");
  await expect
    .poll(() => getComputedStyle(screen.getByTestId("stacked-item").element()).gridTemplateColumns)
    .not.toContain("120px");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
