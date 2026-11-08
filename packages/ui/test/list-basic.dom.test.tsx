import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { List } from "../src/components/list/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test("List renders ordinary rows without item keys or a drag target", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(() =>
      root.render(
        <List>
          <List.Item>
            <List.Content>
              <List.Title>Apricot</List.Title>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Content>
              <List.Title>Avocado</List.Title>
            </List.Content>
          </List.Item>
        </List>,
      ),
    );
    expect([...host.querySelectorAll("li")].map((row) => row.textContent)).toEqual([
      "Apricot",
      "Avocado",
    ]);
    expect(host.querySelector("[data-list-reorder]")).toBeNull();
  } finally {
    await act(() => root.unmount());
    host.remove();
  }
});
