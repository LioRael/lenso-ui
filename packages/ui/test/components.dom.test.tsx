import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Button } from "../src/components/button/index.js";
import { ButtonGroup } from "../src/components/button-group/index.js";
import { GlassButton } from "../src/components/glass-button/index.js";
import { ToggleButton } from "../src/components/toggle-button/index.js";
import { GlassToggleButton } from "../src/components/glass-toggle-button/index.js";
import { ToggleButtonGroup } from "../src/components/toggle-button-group/index.js";
import { Switch } from "../src/components/switch/index.js";
import { Tabs } from "../src/components/tabs/index.js";
import { Tooltip } from "../src/components/tooltip/index.js";
import { Input } from "../src/components/input/index.js";
import { TextArea } from "../src/components/textarea/index.js";
import { TextField } from "../src/components/textfield/index.js";
import { InputGroup } from "../src/components/input-group/index.js";
import { Fieldset } from "../src/components/fieldset/index.js";
import { press } from "../../glass/dist/motion/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});

// Value/focus tests do not catch the competing pointer handlers: native text
// selection must not also translate its input, textarea or owning shell.
test("elastic text editing keeps press feedback without drag deformation", () => {
  const original = globalThis.matchMedia;
  const raf = globalThis.requestAnimationFrame;
  const caf = globalThis.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let time = performance.now();
  let id = 0;
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (key) => {
    frames.delete(key);
  };
  const settle = () => {
    for (let frame = 0; frame < 120 && frames.size; frame++) {
      const callbacks = [...frames.values()];
      frames.clear();
      time += 1000 / 60;
      for (const callback of callbacks) callback(time);
    }
  };
  globalThis.matchMedia = () => original("not all");
  try {
    for (const kind of ["input", "textarea", "shell"] as const) {
      const control = document.createElement(kind === "textarea" ? "textarea" : "input");
      control.value = "Select this text";
      const element = kind === "shell" ? document.createElement("div") : control;
      if (element !== control) element.append(control);
      document.body.append(element);
      element.getBoundingClientRect = () => new DOMRect(0, 0, 360, 52);
      const stop = press(element);
      try {
        control.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            isPrimary: true,
            pointerId: 1,
            button: 0,
            pointerType: "mouse",
            clientX: 30,
            clientY: 25,
          }),
        );
        expect(element.hasAttribute("data-lenso-pressed")).toBe(true);
        settle();
        const scale = element.style.getPropertyValue("--lg-press-scale");
        expect(parseFloat(scale)).toBeGreaterThan(1);
        window.dispatchEvent(
          new PointerEvent("pointermove", { pointerId: 1, buttons: 1, clientX: 220, clientY: 25 }),
        );
        expect(element.style.getPropertyValue("--lg-press-translate")).toBe("0px 0px");
        expect(element.style.getPropertyValue("--lg-press-scale")).toBe(scale);
        window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
        expect(element.hasAttribute("data-lenso-pressed")).toBe(false);
        settle();
        expect(element.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
        control.disabled = true;
        element.dispatchEvent(
          new PointerEvent("pointerdown", {
            isPrimary: true,
            pointerId: 2,
            button: 0,
            pointerType: "mouse",
            clientX: 8,
            clientY: 25,
          }),
        );
        expect(element.hasAttribute("data-lenso-pressed")).toBe(false);
      } finally {
        stop();
      }
    }
    const button = document.createElement("button");
    document.body.append(button);
    button.getBoundingClientRect = () => new DOMRect(0, 0, 100, 44);
    const stop = press(button);
    try {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          isPrimary: true,
          pointerId: 1,
          button: 0,
          pointerType: "mouse",
          clientX: 30,
          clientY: 20,
        }),
      );
      window.dispatchEvent(
        new PointerEvent("pointermove", { pointerId: 1, buttons: 1, clientX: 100, clientY: 20 }),
      );
      settle();
      expect(button.style.getPropertyValue("--lg-press-translate")).not.toBe("0px 0px");
    } finally {
      stop();
    }
  } finally {
    globalThis.matchMedia = original;
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = caf;
  }
});

// The shared Input composition must still register the actual native controls,
// associate labels and clear values through Base UI's change path.
test("grouped fields preserve labels, refs, clearing and native form values", async () => {
  const input = createRef<HTMLElement>();
  let changed: unknown;
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <form>
        <TextField.Group aria-label="Profile">
          <TextField name="name">
            <TextField.Label>Name</TextField.Label>
            <TextField.Input
              ref={input}
              defaultValue="Alex"
              onValueChange={(value) => {
                changed = value;
              }}
            />
          </TextField>
          <TextField name="email">
            <TextField.Label>Email</TextField.Label>
            <Input defaultValue="alex@example.com" />
          </TextField>
          <TextField name="notes">
            <TextField.Label>Notes</TextField.Label>
            <TextArea defaultValue="A note" />
          </TextField>
        </TextField.Group>
      </form>,
    ),
  );
  const nativeInput = container.querySelector("input")!;
  expect(input.current).toBe(nativeInput);
  const labels = [...container.querySelectorAll("label")];
  expect(labels.map((label) => label.htmlFor)).toEqual(
    [...container.querySelectorAll("input, textarea")].map((control) => control.id),
  );
  expect(new FormData(container.querySelector("form")!).get("notes")).toBe("A note");
  await act(() =>
    container.querySelector<HTMLButtonElement>('[data-lenso-slot="text-field-clear"]')!.click(),
  );
  expect(nativeInput.value).toBe("");
  expect(changed).toBe("");
  expect(document.activeElement).toBe(nativeInput);
  expect(new FormData(container.querySelector("form")!).get("name")).toBe("");
});

// Empty padding should focus multiline controls too; interactive adornments
// must keep their own pointer behavior.
test("input shell focuses a textarea without stealing adornment activation", async () => {
  let clicks = 0;
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <TextField name="notes">
        <InputGroup>
          <InputGroup.TextArea aria-label="Notes" />
          <InputGroup.Suffix>
            <button type="button" onClick={() => clicks++}>
              Attach
            </button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>,
    ),
  );
  const shell = container.querySelector<HTMLElement>('[data-lenso-slot="input-group"]')!;
  await act(() => shell.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
  expect(document.activeElement).toBe(container.querySelector("textarea"));
  await act(() => container.querySelector("textarea")!.blur());
  const button = container.querySelector("button")!;
  await act(() => {
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    button.click();
  });
  expect(clicks).toBe(1);
  expect(document.activeElement).not.toBe(container.querySelector("textarea"));
});

// Legacy groups do not exercise mixed sections or Fieldset disabled propagation.
test("fieldset groups retain mixed controls, disabled state and independent sibling fields", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const render = (disabled: boolean) =>
    root!.render(
      <form>
        <Fieldset disabled={disabled}>
          <Fieldset.Legend>Profile</Fieldset.Legend>
          <Fieldset.Group>
            <TextField name="name">
              <TextField.Label>Name</TextField.Label>
              <TextField.Input defaultValue="Alex" />
            </TextField>
            <TextField name="notes" layout="stacked">
              <TextField.Label>Notes</TextField.Label>
              <InputGroup>
                <InputGroup.TextArea defaultValue="A note" />
              </InputGroup>
            </TextField>
            <Fieldset.Row>
              <label htmlFor="notify-test">Notifications</label>
              <Switch id="notify-test" name="notify" defaultChecked>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </Fieldset.Row>
          </Fieldset.Group>
        </Fieldset>
        <TextField name="outside">
          <TextField.Label>Outside</TextField.Label>
          <Input defaultValue="Separate" />
        </TextField>
      </form>,
    );
  await act(() => render(false));
  const fields = [...container.querySelectorAll('[data-lenso-slot="text-field"]')];
  expect(fields.map((field) => field.getAttribute("data-field-layout"))).toEqual([
    "row",
    "stacked",
    "stacked",
  ]);
  expect(container.querySelector('[data-lenso-slot="fieldset-group"]')!.tagName).toBe("DIV");
  expect(container.querySelectorAll("fieldset")).toHaveLength(1);
  const controls = [
    ...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input:not([type='checkbox']), textarea",
    ),
  ];
  const labels = [
    ...container.querySelectorAll<HTMLLabelElement>('label:not([for="notify-test"])'),
  ];
  expect(labels.map((label) => label.htmlFor)).toEqual(controls.map((control) => control.id));
  const form = container.querySelector("form")!;
  expect(new FormData(form).get("notes")).toBe("A note");
  expect(new FormData(form).get("notify")).toBe("on");
  await act(() =>
    container.querySelector<HTMLButtonElement>('[data-lenso-slot="text-field-clear"]')!.click(),
  );
  expect(new FormData(form).get("name")).toBe("");
  await act(() => render(true));
  // Happy DOM does not implement inherited fieldset disabling; browser coverage checks submission and activation.
  const fieldset = container.querySelector("fieldset")!;
  expect(fieldset.disabled).toBe(true);
  expect(controls[0]!.closest("fieldset")).toBe(fieldset);
  expect(controls[1]!.closest("fieldset")).toBe(fieldset);
  expect(controls[2]!.closest("fieldset")).toBeNull();
  expect(controls[2]!.disabled).toBe(false);
});

test("tabs expose selection and switch panels when activated", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <Tabs.Root defaultValue="one">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">First panel</Tabs.Panel>
        <Tabs.Panel value="two">Second panel</Tabs.Panel>
      </Tabs.Root>,
    ),
  );
  const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');
  expect(tabs).toHaveLength(2);
  expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
  expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
  await act(() => tabs[1]!.click());
  expect(tabs[0]!.getAttribute("aria-selected")).toBe("false");
  expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe("Second panel");
});

test("loading buttons report busy and suppress activation", async () => {
  let calls = 0;
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <Button isLoading onClick={() => calls++}>
        Save
      </Button>,
    ),
  );
  const button = container.querySelector("button")!;
  expect(button.getAttribute("aria-busy")).toBe("true");
  await act(() => button.click());
  expect(calls).toBe(0);
  await act(() => root!.render(<Button onClick={() => calls++}>Save</Button>));
  await act(() => button.click());
  expect(calls).toBe(1);
});

// These regressions were absent from the previous Button-only activation coverage:
// group configuration stopped at wrapper components and toggles had no selection tests.
test("ordinary toggles preserve controlled state, refs and render composition", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  let changes = 0;
  const element = createRef<HTMLButtonElement>();
  await act(() =>
    root!.render(
      <ToggleButton
        pressed={false}
        onPressedChange={() => changes++}
        ref={element}
        render={(props, state) => <button {...props} data-selection={String(state.pressed)} />}
        style={(state) => ({ opacity: state.pressed ? 0.9 : 1 })}
      >
        Bold
      </ToggleButton>,
    ),
  );
  const button = container.querySelector("button")!;
  expect(element.current).toBe(button);
  expect(button.getAttribute("data-glass")).toBe("false");
  expect(button.getAttribute("data-selection")).toBe("false");
  await act(() => button.click());
  expect(changes).toBe(1);
  expect(button.getAttribute("aria-pressed")).toBe("false");
  await act(() => root!.render(<ToggleButton pressed>Bold</ToggleButton>));
  expect(container.querySelector("button")!.getAttribute("aria-pressed")).toBe("true");
});

test("glass button groups configure wrapped members and block disabled actions", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  let calls = 0;
  function WrappedAction() {
    return (
      <GlassButton elastic={false} onClick={() => calls++}>
        Next
      </GlassButton>
    );
  }
  await act(() =>
    root!.render(
      <ButtonGroup disabled variant="prominent" size="sm" tint="red">
        <GlassButton elastic={false} onClick={() => calls++}>
          Previous
        </GlassButton>
        <WrappedAction />
      </ButtonGroup>,
    ),
  );
  expect(container.querySelector("fieldset")!.disabled).toBe(true);
  for (const button of container.querySelectorAll("button")) {
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("data-variant")).toBe("prominent");
    expect(button.hasAttribute("data-lenso-group-item")).toBe(true);
    await act(() => button.click());
  }
  expect(calls).toBe(0);
});

test("glass toggle groups preserve multi-selection and disable wrapped members", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  function WrappedToggle() {
    return (
      <GlassToggleButton value="italic" elastic={false}>
        Italic
      </GlassToggleButton>
    );
  }
  const group = (disabled: boolean) => (
    <ToggleButtonGroup multiple defaultValue={["bold"]} disabled={disabled}>
      <GlassToggleButton value="bold" elastic={false}>
        Bold
      </GlassToggleButton>
      <WrappedToggle />
    </ToggleButtonGroup>
  );
  await act(() => root!.render(group(false)));
  const buttons = container.querySelectorAll("button");
  expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
  expect(buttons[1]!.hasAttribute("data-lenso-group-item")).toBe(true);
  await act(() => buttons[1]!.click());
  expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
  expect(buttons[1]!.getAttribute("aria-pressed")).toBe("true");
  await act(() => root!.render(group(true)));
  expect(buttons[0]!.disabled).toBe(true);
  expect(buttons[1]!.disabled).toBe(true);
  await act(() => buttons[1]!.click());
  expect(buttons[1]!.getAttribute("aria-pressed")).toBe("true");
});

test("switches report checked state and update their form value", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <form>
        <Switch.Root name="notifications" value="on" aria-label="Notifications" />
      </form>,
    ),
  );
  const control = container.querySelector<HTMLElement>('[role="switch"]')!;
  const form = container.querySelector("form")!;
  expect(control.getAttribute("aria-checked")).toBe("false");
  expect(new FormData(form).get("notifications")).toBeNull();
  await act(() => control.click());
  expect(control.getAttribute("aria-checked")).toBe("true");
  expect(new FormData(form).get("notifications")).toBe("on");
});

test("tooltip material preserves content, custom arrows, and dismissal", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root!.render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger>Help</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <span data-testid="custom-arrow" />
          </Tooltip.Arrow>
          Helpful information
        </Tooltip.Content>
      </Tooltip.Root>,
    ),
  );
  const popup = document.querySelector('[role="tooltip"]')!;
  expect(popup.textContent).toContain("Helpful information");
  expect(popup.querySelector('[data-testid="custom-arrow"]')).not.toBeNull();
  expect(popup.getAttribute("data-material")).toBe("thick");
  await act(() =>
    container
      .querySelector("button")!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      ),
  );
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  expect(
    popup.hasAttribute("data-ending-style") ||
      popup.hasAttribute("data-closed") ||
      !popup.isConnected,
  ).toBe(true);
});
