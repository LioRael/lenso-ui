import { afterEach, expect, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { parseDate, Time, parseZonedDateTime } from "@internationalized/date";
import { createAgent } from "../src/agent.js";
import { List } from "../src/components/list/index.js";
import { Slider } from "../src/components/slider/index.js";
import { SwipeActions } from "../src/components/swipe-actions/index.js";
import { mockSwipeGeometry } from "./helpers/dom.js";
import { DateField } from "../src/components/date-field/index.js";
import { TimeField } from "../src/components/time-field/index.js";
import { Calendar } from "../src/components/calendar/index.js";
import { ColorPicker } from "../src/components/color-picker/index.js";
import { ColorArea } from "../src/components/color-area/index.js";
import { ColorSlider } from "../src/components/color-slider/index.js";
import { SectionIndex } from "../src/components/section-index/index.js";
import { WheelPicker } from "../src/components/wheel-picker/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
const agent = createAgent();
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});
async function mount(node: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root!.render(node));
  return host;
}
async function key(node: Element, key: string) {
  await act(() =>
    node.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })),
  );
}
async function snapshot() {
  let entries: ReturnType<typeof agent.snapshot> = [];
  await act(() => {
    entries = agent.snapshot();
  });
  return entries;
}
async function change(label: string, action: string, ...args: unknown[]) {
  const entry = (await snapshot()).find((entry) => !entry.offPage && entry.label === label);
  expect(entry).toBeDefined();
  await act(async () => {
    await agent.act({ steps: [{ ref: entry!.ref, action, args }] });
  });
}

// Earlier coverage did not exercise whole-value agents or cancellation across value-model boundaries.
test("date and time share cancellable whole-value changes with their numeric segments", async () => {
  const changes: string[] = [];
  const host = await mount(
    <>
      <DateField
        aria-label="Departure date"
        name="date"
        defaultValue={parseDate("2026-11-13")}
        onValueChange={(value, details) => {
          changes.push(`${value}:${details.source}`);
          if (value?.day === 15) details.cancel();
        }}
      >
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField>
      <TimeField aria-label="Departure time" name="time" defaultValue={new Time(9, 30)}>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField>
    </>,
  );
  await change("Departure date", "setValue", "2026-11-14");
  expect(host.querySelector<HTMLInputElement>('input[name="date"]')!.value).toBe("2026-11-14");
  await change("Departure date", "setValue", "2026-11-15");
  expect(host.querySelector<HTMLInputElement>('input[name="date"]')!.value).toBe("2026-11-14");
  expect(changes).toEqual(["2026-11-14:agent", "2026-11-15:agent"]);
  const day = host.querySelector<HTMLInputElement>('[data-date-segment="day"]')!;
  await act(() => day.focus());
  await key(day, "ArrowLeft");
  expect(document.activeElement).not.toBe(day);
  await key(document.activeElement!, "ArrowRight");
  expect(document.activeElement).toBe(day);
  await key(day, "ArrowUp");
  expect(host.querySelector<HTMLInputElement>('input[name="date"]')!.value).toBe("2026-11-14");
  await change("Departure time", "setValue", "15:45:00");
  expect(host.querySelector<HTMLInputElement>('input[name="time"]')!.value).toBe("15:45:00");
});

test("a zoned date retains its zone and time when changed through the date controller", async () => {
  let value = "";
  await mount(
    <DateField
      aria-label="Zoned departure"
      defaultValue={parseZonedDateTime("2026-11-13T09:30[Asia/Shanghai]")}
      onValueChange={(next) => {
        value = String(next);
      }}
    >
      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
    </DateField>,
  );
  await change("Zoned departure", "setValue", "2026-11-14T11:45[Asia/Shanghai]");
  expect(value).toContain("2026-11-14T11:45:00+08:00[Asia/Shanghai]");
});

test("one color picker owns all channels, preserves powerless hue, and cancels agent changes", async () => {
  const values: string[] = [];
  const host = await mount(
    <ColorPicker
      aria-label="Brand color"
      space="hsl"
      defaultValue="hsl(120, 100%, 50%)"
      onValueChange={(_value, details) => {
        if (details.color.coords[0] === 240) details.cancel();
      }}
      onChange={(color) =>
        values.push(`${color.getChannelValue("hue")}:${color.getChannelValue("saturation")}`)
      }
    >
      <ColorArea>
        <ColorArea.Thumb />
      </ColorArea>
      <ColorSlider channel="hue">
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
    </ColorPicker>,
  );
  expect(
    (await snapshot()).filter((entry) => !entry.offPage && entry.component === "color-picker"),
  ).toHaveLength(1);
  await change("Brand color", "setValue", "hsl(120 0% 50%)");
  expect(values).toEqual(["120:0"]);
  await change("Brand color", "setValue", "hsl(240 100% 50%)");
  expect(values).toHaveLength(1);
  expect(host.querySelector('[role="slider"]')).not.toBeNull();
});

test("standalone hue sliders accept hex defaults without a color-space adapter", async () => {
  const host = await mount(
    <ColorSlider aria-label="Hue" channel="hue" defaultValue="#00ff00">
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>,
  );
  expect(host.querySelector('[role="slider"]')!.getAttribute("aria-valuenow")).toBe("120");
});

test("wheel and section-index agents retain source and cancellation", async () => {
  let wheelSource = "";
  const host = await mount(
    <>
      <WheelPicker
        aria-label="Priority"
        defaultValue="a"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
        onValueChange={(_value, details) => {
          wheelSource = details.source;
          details.cancel();
        }}
      />
      <SectionIndex
        aria-label="Contact index"
        defaultValue="a"
        items={[
          { value: "a", label: "A", href: "#a" },
          { value: "b", label: "B", href: "#b" },
        ]}
        onValueChange={(_value, details) => details.cancel()}
      />
    </>,
  );
  await change("Priority", "setValue", "b");
  expect(wheelSource).toBe("agent");
  expect(host.querySelector('[role="option"][aria-selected="true"]')!.textContent).toBe("Alpha");
  await change("Contact index", "setValue", "b");
  expect(host.querySelector('a[aria-current="location"]')!.textContent).toBe("A");
});

test("calendar roving focus crosses months and whole-date agents can be refused", async () => {
  const host = await mount(
    <Calendar
      aria-label="Booking date"
      defaultValue={parseDate("2026-11-30")}
      onValueChange={(value, details) => {
        if (!Array.isArray(value) && value?.day === 2) details.cancel();
      }}
    >
      <Calendar.Grid>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>,
  );
  const november = host.querySelector<HTMLButtonElement>(
    '[data-calendar-date="2026-11-30"]:not([data-outside-month])',
  )!;
  await act(() => november.focus());
  await key(november, "ArrowRight");
  expect(document.activeElement?.getAttribute("data-calendar-date")).toBe("2026-12-01");
  await change("Booking date", "setValue", "2026-12-02");
  expect(
    (await snapshot()).find((entry) => !entry.offPage && entry.label === "Booking date")!["value"],
  ).toBe("2026-11-30");
});

test("swipe agents use the same cancellable disclosure contract as people", async () => {
  const restore = mockSwipeGeometry();
  let source = "";
  try {
    const host = await mount(
      <SwipeActions
        aria-label="Message actions"
        startActions={[{ id: "archive", label: "Archive", onAction() {} }]}
        endActions={[{ id: "delete", label: "Delete", onAction() {} }]}
        onOpenSideChange={(side, details) => {
          source = details.source;
          if (side === "end") details.cancel();
        }}
      >
        Message
      </SwipeActions>,
    );
    await change("Message actions", "setOpenSide", "start");
    expect(source).toBe("agent");
    expect(host.querySelector('[data-open-side="start"]')).not.toBeNull();
    await change("Message actions", "setOpenSide", "end");
    expect(host.querySelector('[data-open-side="start"]')).not.toBeNull();
  } finally {
    restore();
  }
});

test("presentation markers preserve native SDK slots", async () => {
  const host = await mount(
    <Slider aria-label="Volume" defaultValue={25}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider>,
  );
  expect(host.querySelector('[data-lenso-slot="slider-fill"]')!.getAttribute("data-slot")).toBe(
    "slider-indicator",
  );
});

test("list agents select domain keys and cancel selection and reorder through native details", async () => {
  const values: string[] = [],
    moves: string[] = [];
  const host = await mount(
    <List
      aria-label="Inbox"
      editing
      defaultValue={[]}
      onValueChange={(value, details) => {
        values.push(`${value.join(",")}:${details.source}`);
        if (value.includes("c")) details.cancel();
      }}
      onReorder={(move, details) => {
        moves.push(`${move.targetKey}:${details.source}`);
        details.cancel();
      }}
    >
      <List.Item itemKey="a" textValue="Alpha">
        <List.Title>Alpha</List.Title>
      </List.Item>
      <List.Item itemKey="c" textValue="Charlie">
        <List.Title>Charlie</List.Title>
      </List.Item>
    </List>,
  );
  await change("Inbox", "setValue", ["string:a"]);
  await change("Inbox", "setValue", ["string:c"]);
  expect(values).toEqual(["a:agent", "c:agent"]);
  expect(host.querySelector('[aria-label="Select Alpha"]')!.getAttribute("aria-checked")).toBe(
    "true",
  );
  expect(host.querySelector('[aria-label="Select Charlie"]')!.getAttribute("aria-checked")).toBe(
    "false",
  );
  await change("Inbox", "move", "string:a", 1);
  expect(moves).toEqual(["c:agent"]);
  expect(
    [...host.querySelectorAll<HTMLElement>("[data-list-key]")].map((el) => el.dataset["listKey"]),
  ).toEqual(["a", "c"]);
});
