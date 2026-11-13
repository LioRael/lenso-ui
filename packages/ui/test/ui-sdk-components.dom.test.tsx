import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createAgent } from "../src/agent.js";
import { Disclosure } from "../src/components/disclosure/disclosure.js";
import { Accordion } from "../src/components/accordion/accordion.js";
import { ProgressBar } from "../src/components/progress-bar/progress-bar.js";
import { ProgressCircle } from "../src/components/progress-circle/progress-circle.js";
import { Tabs } from "../src/components/tabs/tabs.js";
import { Toolbar } from "../src/components/toolbar/toolbar.js";
import { ListBox, createListboxController } from "../src/components/list-box/index.js";
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
        <Meter value={20} min={10} max={30} data-lenso-slot="quota">
          <Meter.Label>Storage usage</Meter.Label>
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
      </>,
    ),
  );
  const bar = host.querySelector('[data-lenso-slot="progress-bar"]')!;
  expect(bar.getAttribute("role")).toBe("progressbar");
  expect(bar.getAttribute("aria-valuenow")).toBe("30");
  expect(bar.getAttribute("aria-valuemin")).toBe("10");
  expect(bar.getAttribute("aria-valuemax")).toBe("50");
  expect(
    host.querySelector<HTMLElement>('[data-lenso-slot="progress-bar-fill"]')!.style.width,
  ).toBe("50%");
  expect(
    host.querySelector('[data-lenso-slot="progress-circle"]')!.hasAttribute("aria-valuenow"),
  ).toBe(false);
  expect(Number(host.querySelector("circle")!.getAttribute("stroke-dashoffset"))).toBeCloseTo(
    2 * Math.PI * 16 * 0.75,
  );
  expect(host.querySelector('[data-lenso-slot="quota"]')!.getAttribute("role")).toBe("meter");
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
    host.querySelector('[data-lenso-slot="disclosure-trigger"]')!.getAttribute("aria-expanded"),
  ).toBe("true");
  expect(
    host.querySelector('[data-lenso-slot="toggle-button"]')!.getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    [...host.querySelectorAll('[data-lenso-slot="toggle-button"]')].every(
      (button) => button.getAttribute("aria-pressed") === "true",
    ),
  ).toBe(true);
});

test("accordion uses SDK heading navigation and expansion", async () => {
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
  const triggers = host.querySelectorAll<HTMLButtonElement>(
    '[data-lenso-slot="accordion-trigger"]',
  );
  triggers[0]!.focus();
  await act(() =>
    triggers[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
  );
  expect(document.activeElement).toBe(triggers[0]!);
  await act(() => triggers[1]!.click());
  expect(triggers[1]!.getAttribute("aria-expanded")).toBe("true");
  expect(host.querySelector('[data-lenso-slot="accordion-panel"]')!.textContent).toBe("Tomorrow");
  expect(
    [...host.querySelectorAll('[data-lenso-slot="accordion-panel"]')].some(
      (panel) => panel.textContent === "Thirty days",
    ),
  ).toBe(true);
});

test("native tabs expose agent choices, manual activation and cancellable selection", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <Tabs
        aria-label="Workspace views"
        defaultValue="overview"
        activation="manual"
        elastic={false}
        onValueChange={(value, details) => {
          if (value === "locked") details.cancel();
        }}
      >
        <Tabs.List aria-label="Workspace views">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="activity">Activity</Tabs.Tab>
          <Tabs.Tab value="locked">Locked</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview" keepMounted>
          Project overview
        </Tabs.Panel>
        <Tabs.Panel value="activity" keepMounted>
          Recent activity
        </Tabs.Panel>
      </Tabs>,
    ),
  );
  const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabs[0]!.focus();
  await act(() =>
    tabs[0]!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
    ),
  );
  expect(document.activeElement).toBe(tabs[1]!);
  expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
  await act(() => tabs[1]!.click());
  expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  await act(() => tabs[2]!.click());
  expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  const view = agent
    .snapshot()
    .find((entry) => entry.component === "tabs" && entry.label === "Workspace views")!;
  expect(view.items?.map((item) => item.label)).toEqual(["Overview", "Activity", "Locked"]);
  const overview = view.items!.find((item) => item.label === "Overview")!;
  await act(async () => {
    expect(
      (await agent.act({ steps: [{ ref: view.ref, action: "select", args: [overview.value] }] }))
        .ok,
    ).toBe(true);
  });
  expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
  expect(host.querySelector<HTMLElement>('[data-lenso-slot="tabs-panel"]')!.hidden).toBe(false);
});

test("toolbar forwards native render composition and state children", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  let pressed = 0;
  await act(() =>
    root!.render(
      <Toolbar aria-label="Project actions" elastic={false}>
        <Toolbar.Button
          render={<a href="#project" aria-label="Open project" />}
          onClick={() => pressed++}
        >
          {(state) => (state.disabled ? "Unavailable" : "Open project")}
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Link href="#help">Help</Toolbar.Link>
      </Toolbar>,
    ),
  );
  const link = host.querySelector<HTMLAnchorElement>('a[data-lenso-slot="toolbar-button"]')!;
  expect(link.textContent).toBe("Open project");
  expect(link.getAttribute("href")).toBe("#project");
  await act(() => link.click());
  expect(pressed).toBe(1);
  expect(host.querySelector('[role="separator"]')!.getAttribute("aria-orientation")).toBe(
    "vertical",
  );
});

test("listbox forwards native controller cancellation and selected render state", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const controller = createListboxController<string, true>();
  const requested: string[][] = [];
  await act(() =>
    root!.render(
      <ListBox<string, true>
        multiple
        defaultValue={["a"]}
        controller={controller}
        onValueChange={(value, details) => {
          requested.push(value);
          details.cancel();
        }}
      >
        <ListBox.Item value="a">
          {(state) => (state.selected ? "Selected Alpha" : "Alpha")}
        </ListBox.Item>
        <ListBox.Item value="b" render={<span data-option="beta" />}>
          Beta
        </ListBox.Item>
      </ListBox>,
    ),
  );
  let changed: boolean | undefined;
  await act(() => {
    changed = controller.setValue(["a", "b"]);
  });
  expect(changed).toBe(false);
  expect(requested).toEqual([["a", "b"]]);
  expect(controller.getValue()).toEqual(["a"]);
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("Selected Alpha");
  expect(host.querySelector('[data-option="beta"]')?.getAttribute("role")).toBe("option");
});
