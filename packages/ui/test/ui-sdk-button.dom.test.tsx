import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createAgent } from "../src/agent.js";
import { Button } from "../src/components/button/button.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const agent = createAgent();
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});

test("an agent discovers and presses the styled button with its source", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const ref = createRef<HTMLButtonElement>();
  let source = "";
  await act(() =>
    root!.render(
      <Button
        ref={ref}
        data-slot="custom-action"
        onClick={(_event, details) => {
          source = details.source;
        }}
      >
        Save settings
      </Button>,
    ),
  );
  const entries = agent.snapshot().filter((entry) => !entry.offPage);
  expect(entries.map((entry) => entry.label)).toContain("Save settings");
  for (const entry of entries) expect(entry.label).toBeTruthy();
  expect(ref.current).toBe(container.querySelector('[data-slot="custom-action"]'));
  await act(async () => {
    const result = await agent.act({ steps: [{ ref: "Save settings", action: "press" }] });
    expect(result.ok).toBe(true);
  });
  expect(source).toBe("agent");
});

test("agent activation cannot bypass loading or disabled buttons", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  let clicks = 0;
  await act(() =>
    root!.render(
      <>
        <Button isLoading onClick={() => clicks++}>
          Save pending
        </Button>
        <Button disabled onClick={() => clicks++}>
          Save disabled
        </Button>
      </>,
    ),
  );
  const labels = agent
    .snapshot()
    .filter((entry) => !entry.offPage)
    .map((entry) => entry.label);
  for (const label of ["Save pending", "Save disabled"]) {
    expect(labels).toContain(label);
    await act(async () => {
      await agent.act({ steps: [{ ref: label, action: "press" }] });
    });
  }
  expect(clicks).toBe(0);
});
