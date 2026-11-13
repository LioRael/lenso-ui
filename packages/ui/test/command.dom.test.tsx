import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createCommandController } from "@ui-sdk/react/command";
import { Button } from "../src/components/button/button.js";
import { Modal } from "../src/components/modal/index.js";
import { GlassButton } from "../src/components/glass-button/index.js";
import { GlassFusionContext, type FusionGroup } from "@lenso/glass/react";
import { Command } from "../src/components/command/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  document.body.replaceChildren();
});

// The primitive tests cover navigation and execution. This checks the styled
// boundary retains native refs, state styles and the clear action after wrapping.
test("styled parts retain refs, state styles and clear behavior", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const surface = createRef<HTMLDivElement>();
  const input = createRef<HTMLInputElement>();
  const controller = createCommandController();
  await act(() =>
    root.render(
      <Command
        items={["Settings"]}
        defaultQuery="set"
        controller={controller}
        ref={surface}
        style={{ width: 320 }}
      >
        <Command.Input aria-label="Commands" ref={input} />
        <Button aria-label="Clear search" onClick={() => controller.setQuery("")}>
          Clear
        </Button>
        <Command.List>
          {["Settings"].map((item) => (
            <Command.Item
              key={item}
              value={item}
              style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
            >
              {item}
            </Command.Item>
          ))}
        </Command.List>
      </Command>,
    ),
  );
  expect(surface.current).toBe(host.querySelector('[data-lenso-slot="command"]'));
  expect(surface.current?.style.width).toBe("320px");
  expect(surface.current?.className).not.toBe("");
  expect(input.current?.value).toBe("set");
  expect(host.querySelector('[data-lenso-slot="command-item"]')?.getAttribute("style")).toContain(
    "opacity: 1",
  );
  await act(() => host.querySelector<HTMLButtonElement>('[aria-label="Clear search"]')!.click());
  expect(input.current?.value).toBe("");
});

// A nested Command must not sample through its animated native popup or join
// a surrounding button's fusion plane. Both refs must retain their native nodes.
test("dialog command owns its material on the native popup and keeps its refs", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const popup = createRef<HTMLDivElement>();
  const command = createRef<HTMLDivElement>();
  const group: FusionGroup = { members: new Set(), update() {} };
  const agent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Chrome/150" });
  try {
    await act(() =>
      root.render(
        <GlassFusionContext value={group}>
          <GlassButton>Outside action</GlassButton>
          <Modal defaultOpen>
            <Command.Content
              ref={command}
              contentProps={{
                ref: (node) => {
                  popup.current = node;
                  if (!node) return;
                  node.style.setProperty("--lg-material", "apple");
                  node.style.setProperty("--lenso-material-action-mode", "light");
                  Object.defineProperties(node, {
                    offsetWidth: { value: 300, configurable: true },
                    offsetHeight: { value: 200, configurable: true },
                  });
                },
                "aria-label": "Command dialog",
              }}
            >
              <Command.Input aria-label="Find commands" />
              <Command.List>
                <Command.Item value="save">Save file</Command.Item>
              </Command.List>
            </Command.Content>
          </Modal>
        </GlassFusionContext>,
      ),
    );
    expect(popup.current?.hasAttribute("popover")).toBe(true);
    expect(popup.current?.style.getPropertyValue("--lg-filter")).toContain("url(");
    expect(command.current?.style.getPropertyValue("--lg-filter")).toBe("");
    expect(popup.current?.contains(command.current)).toBe(true);
    expect(command.current?.querySelector("input")?.getAttribute("aria-label")).toBe(
      "Find commands",
    );
    expect([...group.members].map((el) => el.textContent)).toEqual(["Outside action"]);
  } finally {
    if (agent) Object.defineProperty(navigator, "userAgent", agent);
    else Reflect.deleteProperty(navigator, "userAgent");
  }
});
