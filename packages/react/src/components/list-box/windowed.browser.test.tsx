import { useRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { useCollectionWindow } from "./windowed";

function WindowFixture() {
  const viewport = useRef<HTMLDivElement>(null);
  const collection = useCollectionWindow(100, { height: 60, rowHeight: 20, overscan: 3 }, viewport);
  return (
    <>
      <button onClick={() => collection.scrollTo(50)}>Down</button>
      <button onClick={() => collection.scrollTo(0)}>Up</button>
      <output data-testid="indices">{collection.indices.join(",")}</output>
      <div ref={viewport} data-testid="viewport" style={{ height: 60, overflow: "auto" }}>
        {Array.from({ length: 100 }, (_, index) => (
          <div key={index} data-window-index={index} style={{ height: 20 }}>
            <button
              data-slot="list-box-item"
              style={{ height: 20, boxSizing: "border-box", verticalAlign: "top" }}
            >
              Row {index}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// Offscreen keyboard selection tests do not prove direct helper scroll/focus requests.
test("collection window scrollTo updates indices and focuses the requested row in both directions", async () => {
  const screen = await render(<WindowFixture />);
  await screen.getByRole("button", { name: "Down", exact: true }).click();
  await expect.poll(() => document.activeElement?.textContent).toBe("Row 50");
  const viewport = screen.getByTestId("viewport").element();
  expect(viewport.scrollTop).toBe(960);
  expect(screen.getByTestId("indices").element().textContent?.split(",")).toContain("50");
  await screen.getByRole("button", { name: "Up", exact: true }).click();
  await expect.poll(() => document.activeElement?.textContent).toBe("Row 0");
  expect(viewport.scrollTop).toBe(0);
});
