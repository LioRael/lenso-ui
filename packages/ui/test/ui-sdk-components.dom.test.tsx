import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createAgent } from "../src/agent.js";
import { Disclosure } from "../src/components/disclosure/disclosure.js";
import { Accordion } from "../src/components/accordion/accordion.js";
import { ProgressBar } from "../src/components/progress-bar/progress-bar.js";
import { ProgressCircle } from "../src/components/progress-circle/progress-circle.js";
import { Meter } from "../src/components/meter/meter.js";
import { ToggleButtonGroup } from "../src/components/toggle-button-group/toggle-button-group.js";
import { ToggleButton } from "../src/components/toggle-button/toggle-button.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const agent = createAgent();
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});

test("measurements retain names, custom slots, ranges and unknown progress", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <>
        <ProgressBar value={30} min={10} max={50}>
          <ProgressBar.Label>Upload status</ProgressBar.Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
        <ProgressCircle aria-label="Background sync">
          <ProgressCircle.Track>
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
        <Meter value={20} min={10} max={30} data-slot="quota">
          <Meter.Label>Storage usage</Meter.Label>
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
      </>,
    ),
  );
  const bar = host.querySelector('[data-slot="progress-bar"]')!;
  expect(bar.getAttribute("role")).toBe("progressbar");
  expect(bar.getAttribute("aria-valuenow")).toBe("30");
  expect(bar.getAttribute("aria-valuemin")).toBe("10");
  expect(bar.getAttribute("aria-valuemax")).toBe("50");
  expect(host.querySelector<HTMLElement>('[data-slot="progress-bar-fill"]')!.style.width).toBe(
    "50%",
  );
  expect(host.querySelector('[data-slot="progress-circle"]')!.hasAttribute("aria-valuenow")).toBe(
    false,
  );
  expect(Number(host.querySelector("circle")!.getAttribute("stroke-dashoffset"))).toBeCloseTo(
    2 * Math.PI * 16 * 0.75,
  );
  expect(host.querySelector('[data-slot="quota"]')!.getAttribute("role")).toBe("meter");
  const labels = agent
    .snapshot()
    .filter((entry) => !entry.offPage)
    .map((entry) => entry.label);
  for (const label of ["Upload status", "Background sync", "Storage usage"])
    expect(labels).toContain(label);
});

test("an agent opens a disclosure and toggles a group through the styled parts", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <>
        <Disclosure>
          <Disclosure.Trigger>Shipping details</Disclosure.Trigger>
          <Disclosure.Content keepMounted>Ships tomorrow</Disclosure.Content>
        </Disclosure>
        <ToggleButtonGroup aria-label="Text formatting" multiple>
          <ToggleButton value="bold">Bold text</ToggleButton>
          <ToggleButton value="italic">Italic text</ToggleButton>
        </ToggleButtonGroup>
      </>,
    ),
  );
  const entries = agent.snapshot().filter((entry) => !entry.offPage);
  for (const entry of entries) expect(entry.label).toBeTruthy();
  await act(async () => {
    expect(
      (await agent.act({ steps: [{ ref: "Shipping details", action: "setOpen", args: [true] }] }))
        .ok,
    ).toBe(true);
    expect(
      (await agent.act({ steps: [{ ref: "Bold text", action: "setPressed", args: [true] }] })).ok,
    ).toBe(true);
    expect(
      (await agent.act({ steps: [{ ref: "Italic text", action: "setPressed", args: [true] }] })).ok,
    ).toBe(true);
  });
  expect(
    host.querySelector('[data-slot="disclosure-trigger"]')!.getAttribute("aria-expanded"),
  ).toBe("true");
  expect(host.querySelector('[data-slot="toggle-button"]')!.getAttribute("aria-pressed")).toBe(
    "true",
  );
  expect(
    [...host.querySelectorAll('[data-slot="toggle-button"]')].every(
      (button) => button.getAttribute("aria-pressed") === "true",
    ),
  ).toBe(true);
});

test("accordion keeps its Lenso keyboard extension and SDK expansion", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <Accordion aria-label="Order questions">
        <Accordion.Item value="delivery">
          <Accordion.Heading>
            <Accordion.Trigger>Delivery time</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel keepMounted>Tomorrow</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="returns">
          <Accordion.Heading>
            <Accordion.Trigger>Return policy</Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>Thirty days</Accordion.Panel>
        </Accordion.Item>
      </Accordion>,
    ),
  );
  const triggers = host.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]');
  triggers[0]!.focus();
  await act(() =>
    triggers[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
  );
  expect(document.activeElement).toBe(triggers[1]!);
  await act(() => triggers[1]!.click());
  expect(triggers[1]!.getAttribute("aria-expanded")).toBe("true");
  expect(host.querySelector('[data-slot="accordion-panel"]')!.textContent).toBe("Tomorrow");
  expect(
    [...host.querySelectorAll('[data-slot="accordion-panel"]')].some(
      (panel) => panel.textContent === "Thirty days",
    ),
  ).toBe(true);
});
